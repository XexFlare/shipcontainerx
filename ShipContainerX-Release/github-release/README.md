# ShipContainerX

**An open, source-cited dataset of ISO container types.**

ShipContainerX describes the standard shipping containers: inside and outside dimensions, door
and roof openings, tare, maximum gross and payload weights, capacity, ISO 6346 size-type codes,
reefer temperature ranges and the cargo each type suits. 17 types, every value with its source and
a confidence level.

| | |
|---|---|
| Version | **1.0.0** |
| Generated | 2026-10-17 |
| Records | 17: 16 `VERIFIED`, 1 `PARTIAL` (the 20ft tank) |
| Categories | dry 4, reefer 2, open top 3, hardtop 3, flat rack 2, platform 2, tank 1 |
| Source register | 11 sources |
| License | [CC BY 4.0](LICENSE) |

> Values are representative figures from one series of the carriers' fleets, not a manufacturer
> catalogue. Individual containers vary by manufacturer and series; ranges are in the notes of
> `fields_detail`. Check the box you are actually using.

## Repository layout

```text
.
├── data/                       the dataset (all formats hold the same 17 records)
│   ├── shipcontainerx.csv      flat table, 33 columns
│   ├── shipcontainerx.parquet  same table, typed
│   ├── shipcontainerx.json     metadata envelope + records, with fields_detail provenance
│   ├── shipcontainerx.jsonl    one record per line, with fields_detail provenance
│   ├── sources.csv             the source register (11 sources)
│   └── SHA256SUMS
├── docs/
│   ├── SCHEMA.md               every field, type and convention
│   ├── PROVENANCE.md           sources, confidence levels, methodology
│   ├── DATA_QUALITY.md         validation method, known limits
│   └── API.md                  the public HTTP API
├── reports/                    build reports and the release validation report
├── scripts/validate.mjs        integrity checks for data/ (Node.js)
├── examples/                   JavaScript and Python usage examples
└── CHANGELOG.md · CONTRIBUTING.md · CITATION.cff · LICENSE
```

| File | Role |
|---|---|
| `data/shipcontainerx.parquet` | Best for analysis (pandas, Polars, DuckDB). |
| `data/shipcontainerx.csv` | Spreadsheets and quick inspection. Empty cell = null; lists joined with `"; "`. |
| `data/shipcontainerx.json` | Web apps and full provenance; includes dataset metadata. |
| `data/shipcontainerx.jsonl` | Streaming; Hugging Face `datasets`; includes provenance. |
| `data/sources.csv` | Resolve `source_ids` to source names, URLs and evidence tiers. |

## Quick start

### Python

```bash
pip install -r requirements.txt
python examples/python/load_pandas.py
python examples/python/load_json.py
```

```python
import pandas as pd

df = pd.read_parquet("data/shipcontainerx.parquet")
reefers = df[df["category"] == "reefer"]
heavy = df[df["max_payload_kg"] > 28000]
```

### JavaScript (Node.js 20+)

```js
import { readFileSync } from 'node:fs';
const { version, records } = JSON.parse(readFileSync('data/shipcontainerx.json', 'utf8'));
const hc40 = records.find((r) => r.id === '40-hc-dry');
console.log(hc40.internal_length_mm, hc40.fields_detail.internal_length_mm.source_ids);
```

### HTTP API

If you deploy the ShipContainerX API (or use a public deployment once announced):

```bash
curl "https://<api-host>/api/v1/containers?category=reefer&client=myapp"
curl "https://<api-host>/api/v1/containers/45G1"
curl "https://<api-host>/api/v1/cargo?q=vehicles"
```

See [docs/API.md](docs/API.md).

## Key conventions

- **`id` is stable** (for example `40-hc-dry`); `iso_size_type` (for example `45G1`) also resolves to a record in the API.
- **Units:** millimetres, kilograms, cubic metres, degrees Celsius.
- **`null` means "no source read yet"**, not zero.
- **`max_payload_kg` = `max_gross_kg` minus `tare_kg`.**
- **Confidence** (`CONFIRMED`, `STRONG`, `SUPPORTED`) per value is in `fields_detail` (JSON and JSONL).

Full details: [docs/SCHEMA.md](docs/SCHEMA.md) and [docs/PROVENANCE.md](docs/PROVENANCE.md).

## Validation

```bash
npm install
npm run validate
```

Checks record counts, identifier uniqueness, cross-format equality (JSON, JSONL, CSV, Parquet),
payload arithmetic, dimensions, capacity, source references and checksums.
**These are format and consistency checks, not an independent re-verification of the research.**
The release report is in [reports/release-validation-report.md](reports/release-validation-report.md).

## Releases and size

The data files total well under 1 MB, so they are kept in Git. Each release is tagged (`v1.0.0`);
attach the five `data/` files and `SHA256SUMS` to the GitHub release for direct download. The same
files are mirrored on Hugging Face.

## Contributing and reporting issues

Corrections with a public source are very welcome, see [CONTRIBUTING.md](CONTRIBUTING.md) and the
issue templates.

## License and citation

Data, documentation and reports: [CC BY 4.0](LICENSE). Cite as "ShipContainerX v1.0.0"; see
[CITATION.cff](CITATION.cff). Facts remain attributable to their original sources, which keep
their own terms.
