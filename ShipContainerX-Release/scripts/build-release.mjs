// Builds the ShipContainerX release artefacts from ../Data: byte-identical data copies for the
// Hugging Face and GitHub packages, SHA256SUMS, the GitHub reports and the release manifest.
// Originals are only read. Safe to re-run.
//
//   node scripts/build-release.mjs

import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RELEASE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_ROOT = join(RELEASE_ROOT, '..');
const DATA = join(PROJECT_ROOT, 'Data');
const config = JSON.parse(readFileSync(join(RELEASE_ROOT, 'release.config.json'), 'utf8'));

const DATA_FILES = ['shipcontainerx.csv', 'shipcontainerx.json', 'shipcontainerx.jsonl', 'shipcontainerx.parquet', 'sources.csv'];
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const rel = (p) => relative(RELEASE_ROOT, p).split('\\').join('/');
const log = (msg) => console.log(`• ${msg}`);

const payload = JSON.parse(readFileSync(join(DATA, 'shipcontainerx.json'), 'utf8'));
if (payload.version !== config.version) throw new Error(`release.config.json version ${config.version} != dataset version ${payload.version}`);
if (payload.records.length !== payload.record_count) throw new Error('JSON record_count does not match the records');

const checksums = Object.fromEntries(DATA_FILES.map((f) => [f, sha256(join(DATA, f))]));
const sums = DATA_FILES.map((f) => `${checksums[f]}  ${f}`).join('\n') + '\n';

// Overwritten in place (not wiped) so the Hugging Face Parquet twins from build_hf_parquet.py survive.
const targets = [join(RELEASE_ROOT, 'huggingface-dataset', 'data'), join(RELEASE_ROOT, 'github-release', 'data')];
for (const dir of targets) {
  mkdirSync(dir, { recursive: true });
  for (const f of DATA_FILES) cpSync(join(DATA, f), join(dir, f));
  writeFileSync(join(dir, 'SHA256SUMS'), sums);
  log(`Copied ${DATA_FILES.length} data files -> ${rel(dir)}`);
}

const ghReports = join(RELEASE_ROOT, 'github-release', 'reports');
mkdirSync(ghReports, { recursive: true });
for (const f of ['dataset_summary.json', 'validation_report.json']) cpSync(join(PROJECT_ROOT, 'reports', f), join(ghReports, f));
cpSync(join(PROJECT_ROOT, 'SCHEMA.md'), join(RELEASE_ROOT, 'github-release', 'docs', 'SCHEMA.md'));
cpSync(join(RELEASE_ROOT, 'scripts', 'validate.mjs'), join(RELEASE_ROOT, 'github-release', 'scripts', 'validate.mjs'));
log('Copied build reports, SCHEMA.md and validate.mjs -> github-release');

mkdirSync(join(RELEASE_ROOT, 'docs'), { recursive: true });
writeFileSync(
  join(RELEASE_ROOT, 'docs', 'release-manifest.json'),
  JSON.stringify(
    {
      dataset: payload.dataset,
      version: payload.version,
      generated: payload.generated,
      release_prepared: config.release_prepared,
      license: config.license.spdx,
      source_files: DATA_FILES.map((f) => ({ path: `Data/${f}`, sha256: checksums[f] })),
      statistics: { total_records: payload.record_count },
      outputs: targets.map(rel),
    },
    null,
    2,
  ) + '\n',
);
log('Wrote docs/release-manifest.json');
console.log(`\nBuild complete: ShipContainerX v${config.version}`);
