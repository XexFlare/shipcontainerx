// Calls a deployed ShipContainerX API. Set SHIPCONTAINERX_API to the site address.
//   SHIPCONTAINERX_API=https://<api-host> node examples/javascript/api-client.mjs
const base = process.env.SHIPCONTAINERX_API;
if (!base) {
  console.error('Set SHIPCONTAINERX_API to the API address first.');
  process.exit(1);
}
const res = await fetch(`${base}/api/v1/containers?category=reefer&client=example`);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const { data, meta } = await res.json();
console.log(meta);
for (const c of data) console.log(c.id, c.iso_size_type, c.max_payload_kg);
