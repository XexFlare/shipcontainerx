# ShipContainerX

**An open, source-cited dataset of ISO container types.**

Dimensions inside and out, door and roof openings, tare, maximum gross and payload weights,
capacity, ISO 6346 size-type codes, reefer temperature ranges and the cargo each type suits. 17
types: 20ft, 40ft, 40ft high cube and 45ft high cube dry; 20ft and 40ft high cube reefer; open top
and hardtop; flat rack; platform; and a partial 20ft tank. Every value cites its source and a
confidence level.

| | |
|---|---|
| Version | **1.0.0** (generated 2026-10-17) |
| Records | 17 (16 `VERIFIED`, 1 `PARTIAL`) |
| Sources | 11 (Hapag-Lloyd booklet and product pages, Ocean Network Express brochure) |
| Formats | CSV, JSON, JSONL, Parquet, plus `sources.csv` |
| License | Data and docs [CC BY 4.0](LICENSE); code MIT |

> Values are representative figures from one series of the carriers' fleets, not a manufacturer
> catalogue. Individual containers vary by manufacturer and series. Check the box you are using.

## Get the data

- **Files:** [`Data/`](Data) holds the dataset. The same files, with checksums, docs and examples,
  are packaged in [`ShipContainerX-Release/github-release/`](ShipContainerX-Release/github-release/README.md).
- **Hugging Face:** the dataset card and Parquet configs are in
  [`ShipContainerX-Release/huggingface-dataset/`](ShipContainerX-Release/huggingface-dataset/README.md)
  (upload steps in `PUBLISHING.md` there).
- **API:** a read-only JSON API with filters (category, length, payload, capacity, cargo) is in
  [`ShipContainerX-Release/`](ShipContainerX-Release/README.md).

```python
import pandas as pd

df = pd.read_parquet("Data/shipcontainerx.parquet")
reefers = df[df["category"] == "reefer"]
```

## What is in this repository

| Path | Contents |
|---|---|
| `Data/` | Published files: `shipcontainerx.csv`, `.json`, `.jsonl`, `.parquet`, `sources.csv` |
| `SCHEMA.md` | Field reference |
| `reports/` | Build summary and validation report |
| `scripts/build_dataset.py` | Builds `Data/` from the research records (the records themselves are kept private); tests with `python -m unittest discover scripts` |
| `ShipContainerX-Release/` | API, Hugging Face package, GitHub package, validation and release tooling |

## Known limits

The 20ft tank is partial. Pallet-wide containers, standard-height and genset reefers, fixed-end
flat racks, ventilated and bulk containers are not covered yet. See
[`DATA_QUALITY.md`](ShipContainerX-Release/github-release/docs/DATA_QUALITY.md).

## Contributing

Corrections with a public source are welcome: see
[`CONTRIBUTING.md`](ShipContainerX-Release/github-release/CONTRIBUTING.md).

## License and citation

Dataset, documentation and reports: CC BY 4.0, cite as "ShipContainerX v1.0.0" (see
[`CITATION.cff`](ShipContainerX-Release/github-release/CITATION.cff)). Scripts and API code: MIT.
Facts remain attributable to their original sources, which keep their own terms.
