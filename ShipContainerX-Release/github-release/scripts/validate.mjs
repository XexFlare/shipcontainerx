// Integrity checks for the ShipContainerX data files. Runs in the release workspace and, as a
// copy, in the standalone GitHub package.
//
//   node scripts/validate.mjs [data-dir]
//
// Exits non-zero if any check fails. These are format and consistency checks. They do NOT
// independently verify the research (whether a figure matches the manufacturer or carrier).

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const standalone = existsSync(join(ROOT, 'data', 'shipcontainerx.json'));
const DATA = resolve(process.argv[2] ?? (standalone ? join(ROOT, 'data') : join(ROOT, '..', 'Data')));

const checks = [];
const check = (id, description, passed, details) =>
  checks.push({ id, description, passed: Boolean(passed), ...(details !== undefined ? { details } : {}) });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') row.push(field), (field = '');
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field), rows.push(row), (row = []), (field = '');
    } else field += ch;
  }
  if (field || row.length) row.push(field), rows.push(row);
  const [head, ...body] = rows.filter((r) => r.some((c) => c !== ''));
  return { header: head, rows: body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? '']))) };
}

const read = (f) => readFileSync(join(DATA, f), 'utf8');
const payload = JSON.parse(read('shipcontainerx.json'));
const json = payload.records;
const jsonl = read('shipcontainerx.jsonl').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
const csv = parseCsv(read('shipcontainerx.csv'));
const sources = parseCsv(read('sources.csv'));

const openParquet = async (path) => {
  const { parquetReadObjects } = await import('hyparquet');
  const buf = readFileSync(path);
  return parquetReadObjects({ file: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) });
};
let parquet = null;
try {
  parquet = await openParquet(join(DATA, 'shipcontainerx.parquet'));
} catch (err) {
  console.warn(`Parquet not checked (${err.code ?? err.message}). Run "npm install" to enable.`);
}

// 1. Counts
const n = payload.record_count;
check('count.json', `JSON record_count (${n}) equals the number of records`, json.length === n, json.length);
check('count.jsonl', 'JSONL line count equals record_count', jsonl.length === n, jsonl.length);
check('count.csv', 'CSV row count equals record_count', csv.rows.length === n, csv.rows.length);
if (parquet) check('count.parquet', 'Parquet row count equals record_count', parquet.length === n, parquet.length);

// 2. Identifiers and required fields
const ids = json.map((r) => r.id);
check('id.unique', 'id values are unique', new Set(ids).size === ids.length);
check('id.format', 'id is lower-case letters, digits and hyphens', ids.every((id) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)));
const isos = json.map((r) => r.iso_size_type).filter(Boolean);
check('iso.unique', 'ISO size-type codes are unique', new Set(isos).size === isos.length);
check(
  'iso.format',
  'ISO size-type code is 4 characters (letters and digits)',
  isos.every((c) => /^[0-9A-Z]{4}$/.test(c)),
  isos.filter((c) => !/^[0-9A-Z]{4}$/.test(c)),
);
const REQUIRED = ['id', 'name', 'category', 'iso_type_group', 'height_class', 'nominal_length_ft', 'external_length_mm', 'external_width_mm', 'research_status', 'source_ids'];
const missing = json.flatMap((r) =>
  REQUIRED.filter((f) => r[f] === null || r[f] === undefined || r[f] === '' || (Array.isArray(r[f]) && !r[f].length)).map((f) => `${r.id}.${f}`),
);
check('schema.required', `Required fields present: ${REQUIRED.join(', ')}`, missing.length === 0, missing);
const keys = Object.keys(json[0]);
check('schema.keys', 'Every JSON record has the same fields in the same order', json.every((r) => isDeepStrictEqual(Object.keys(r), keys)));
const flatKeys = keys.filter((k) => k !== 'fields_detail');
check('schema.csv_columns', 'CSV columns equal the JSON fields minus fields_detail', isDeepStrictEqual(csv.header, flatKeys));
if (parquet) check('schema.parquet_columns', 'Parquet columns equal the CSV columns', isDeepStrictEqual(Object.keys(parquet[0]), csv.header));
const categories = new Set(payload.vocabularies.category);
check('vocab.category', 'category is in the published vocabulary', json.every((r) => categories.has(r.category)));
check('vocab.status', 'research_status is VERIFIED or PARTIAL', json.every((r) => ['VERIFIED', 'PARTIAL'].includes(r.research_status)));

// 3. Cross-format equality (JSON is the reference)
check('format.jsonl', 'JSONL records are deep-equal to JSON records', isDeepStrictEqual(jsonl, json));
const flat = (v) =>
  v === null || v === undefined ? '' : Array.isArray(v) ? v.map((x) => (typeof x === 'object' ? x.category : x)).join('; ') : String(v);
const csvDiff = [];
json.forEach((r, i) => {
  for (const f of flatKeys) {
    const cell = csv.rows[i][f];
    const same = typeof r[f] === 'number' ? cell !== '' && Number(cell) === r[f] : flat(r[f]) === cell;
    if (!same) csvDiff.push(`${r.id}.${f}`);
  }
});
check('format.csv', 'Every CSV cell matches the JSON value (lists joined with "; ")', csvDiff.length === 0, csvDiff.slice(0, 10));
if (parquet) {
  const pqDiff = [];
  json.forEach((r, i) => {
    for (const f of flatKeys) {
      const a = typeof parquet[i][f] === 'bigint' ? Number(parquet[i][f]) : parquet[i][f];
      const b = flat(r[f]);
      const ok = a === null || a === undefined ? b === '' : typeof a === 'number' ? a === Number(b) : String(a) === b;
      if (!ok) pqDiff.push(`${r.id}.${f}`);
    }
  });
  check('format.parquet', 'Every Parquet value matches the JSON value', pqDiff.length === 0, pqDiff.slice(0, 10));
}

// 4. Numbers
const physical = [];
const arith = [];
for (const r of json) {
  if (r.max_gross_kg != null && r.tare_kg != null && r.max_payload_kg !== r.max_gross_kg - r.tare_kg) arith.push(r.id);
  for (const d of ['length', 'width', 'height']) {
    const inside = r[`internal_${d}_mm`];
    const outside = r[`external_${d}_mm`];
    if (inside != null && outside != null && inside >= outside) physical.push(`${r.id}.${d}`);
  }
}
check('numbers.payload', 'max_payload_kg = max_gross_kg minus tare_kg', arith.length === 0, arith);
check('numbers.inside_lt_outside', 'Inside dimensions are smaller than the outside dimensions', physical.length === 0, physical);
const capOff = json
  .filter((r) => r.capacity_m3 != null && r.internal_length_mm && r.internal_width_mm && r.internal_height_mm)
  .filter((r) => Math.abs((r.internal_length_mm * r.internal_width_mm * r.internal_height_mm) / 1e9 - r.capacity_m3) / r.capacity_m3 > 0.05)
  .map((r) => r.id);
check('numbers.capacity', 'capacity_m3 is within 5% of length x width x height', capOff.length === 0, capOff);

// 5. Sources and provenance
const sourceIds = new Set(sources.rows.map((s) => s.source_id));
check('sources.unique', 'source_id values are unique', sourceIds.size === sources.rows.length);
const unresolved = json.flatMap((r) => r.source_ids.filter((s) => !sourceIds.has(s)).map((s) => `${r.id}:${s}`));
check('sources.resolve', 'Every source_ids entry exists in sources.csv', unresolved.length === 0, unresolved);
const detailBad = json.flatMap((r) =>
  Object.entries(r.fields_detail)
    .filter(([f, d]) => !('value' in d) || !isDeepStrictEqual(d.value, r[f]) || (d.source_ids ?? []).some((s) => !sourceIds.has(s)))
    .map(([f]) => `${r.id}.${f}`),
);
check('provenance.fields_detail', 'fields_detail values equal the record values and cite registered sources', detailBad.length === 0, detailBad.slice(0, 10));
const levels = new Set(payload.vocabularies.confidence);
check(
  'provenance.confidence',
  'Every confidence is CONFIRMED, STRONG or SUPPORTED (or empty for definitions)',
  json.every((r) => Object.values(r.fields_detail).every((d) => d.confidence == null || levels.has(d.confidence))),
);
const uncited = json.flatMap((r) =>
  Object.entries(r.fields_detail)
    .filter(([, d]) => d.confidence && !(d.source_ids ?? []).length)
    .map(([f]) => `${r.id}.${f}`),
);
check('provenance.cited', 'Every field with a confidence cites at least one source', uncited.length === 0, uncited.slice(0, 10));
const cargoBad = json.flatMap((r) => (r.typical_cargo ?? []).filter((c) => !c.category || !c.why || !(c.source_ids ?? []).length).map((c) => `${r.id}:${c.category}`));
check('provenance.cargo', 'Every typical_cargo entry has a reason and a source', cargoBad.length === 0, cargoBad);
const unused = [...sourceIds].filter((s) => !json.some((r) => r.source_ids.includes(s)));
check('sources.used', 'Every registered source is cited by at least one record', unused.length === 0, unused);

// 6. Checksums
const sumsPath = join(DATA, 'SHA256SUMS');
if (existsSync(sumsPath)) {
  const bad = [];
  for (const line of readFileSync(sumsPath, 'utf8').split(/\r?\n/).filter(Boolean)) {
    const [sum, file] = line.split(/\s+/);
    if (createHash('sha256').update(readFileSync(join(DATA, file))).digest('hex') !== sum) bad.push(file);
  }
  check('checksums', 'SHA256SUMS matches every data file', bad.length === 0, bad);
}

// 7. Hugging Face twins (release workspace only)
const hfData = join(ROOT, 'huggingface-dataset', 'data');
if (!standalone && parquet && existsSync(join(hfData, 'shipcontainerx_full.parquet'))) {
  const plain = (v) => JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? Number(x) : x)));
  const strip = (v) =>
    Array.isArray(v)
      ? v.map(strip)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== null && x !== undefined).map(([k, x]) => [k, strip(x)]))
        : v;
  const full = plain(await openParquet(join(hfData, 'shipcontainerx_full.parquet')));
  const fullDiff = json.filter((r, i) => !isDeepStrictEqual(strip(r), strip(full[i]))).map((r) => r.id);
  check('hf.full', 'shipcontainerx_full.parquet equals the JSONL records (nulls ignored)', full.length === n && fullDiff.length === 0, fullDiff);
  const src = plain(await openParquet(join(hfData, 'sources.parquet')));
  check('hf.sources', 'sources.parquet equals sources.csv', isDeepStrictEqual(src, sources.rows));
}

// Report
const failed = checks.filter((c) => !c.passed);
const stamp = new Date().toISOString().slice(0, 10);
const md = [
  '# ShipContainerX release validation',
  '',
  `Dataset ${payload.dataset} v${payload.version}, ${n} records, checked ${stamp}. ${checks.length - failed.length} of ${checks.length} checks pass.`,
  '',
  '> These are automated format and consistency checks. They do not independently re-verify the research.',
  '',
  '| Result | Check | Details |',
  '|---|---|---|',
  ...checks.map((c) => `| ${c.passed ? 'PASS' : 'FAIL'} | ${c.description} | ${c.passed ? '' : JSON.stringify(c.details)} |`),
  '',
].join('\n');
const outDir = standalone ? join(ROOT, 'reports') : join(ROOT, 'docs', 'validation');
mkdirSync(outDir, { recursive: true });
const name = standalone ? 'release-validation-report' : 'validation-report';
writeFileSync(join(outDir, standalone ? `${name}.md` : 'VALIDATION_REPORT.md'), md);
writeFileSync(join(outDir, `${name}.json`), JSON.stringify({ dataset: payload.dataset, version: payload.version, checked: stamp, checks }, null, 2) + '\n');
for (const c of checks) console.log(`${c.passed ? 'PASS' : 'FAIL'}  ${c.description}`);
console.log(`\n${checks.length - failed.length}/${checks.length} checks pass`);
if (failed.length) process.exit(1);
