// Reads data/shipcontainerx.json and prints the container types that carry more than 28 t.
//   node examples/javascript/read-json.mjs
import { readFileSync } from 'node:fs';

const { version, record_count, records } = JSON.parse(
  readFileSync(new URL('../../data/shipcontainerx.json', import.meta.url), 'utf8'),
);
console.log(`ShipContainerX v${version}: ${record_count} container types`);

for (const r of records.filter((x) => x.max_payload_kg > 28000)) {
  console.log(`${r.id.padEnd(14)} ${String(r.max_payload_kg).padStart(6)} kg  ${r.capacity_m3 ?? '?'} m3`);
}

const hc = records.find((x) => x.id === '40-hc-dry');
console.log('\n40ft high cube inside length:', hc.internal_length_mm, 'mm');
console.log('Confidence and sources:', hc.fields_detail.internal_length_mm);
