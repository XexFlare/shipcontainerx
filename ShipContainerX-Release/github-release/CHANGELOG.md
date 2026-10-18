# Changelog

All notable changes to ShipContainerX. Versions follow semantic versioning for the dataset:
major = breaking schema change, minor = new records or fields, patch = corrections.

## [1.0.0]: dataset generated 2026-10-17, release package 2026-10-18

### Added
- Licensed under CC BY 4.0.
- First public release: 17 container types (16 `VERIFIED`, 1 `PARTIAL`): dry 20, 40, 40 high cube
  and 45 high cube; reefer 20 and 40 high cube; open top and hardtop 20, 40 and 40 high cube; flat
  rack 20 and 40 high cube; platform 20 and 40; tank 20.
- Formats: `shipcontainerx.csv`, `shipcontainerx.parquet`, `shipcontainerx.json`,
  `shipcontainerx.jsonl`; `sources.csv` with 11 registered sources; `SHA256SUMS`.
- Field-level provenance (`fields_detail`) in JSON and JSONL: value, confidence, sources, notes.
- Documentation: schema, provenance, data quality, API.
- `scripts/validate.mjs`: automated integrity checks; JavaScript and Python examples.

## Planned for a future version (not in 1.0.0)

- Pallet-wide containers, standard-height and genset reefers, fixed-end flat racks, ventilated and
  bulk containers, and tank capacities and weights, once sources are found.
