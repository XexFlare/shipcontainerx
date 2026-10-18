# Changelog

## 1.0.0: generated 2026-10-17, release package prepared 2026-10-18

First public release.

- 17 container types: dry 20, 40, 40 high cube and 45 high cube; reefer 20 and 40 high cube;
  open top and hardtop 20, 40 and 40 high cube; flat rack 20 and 40 high cube; platform 20 and 40;
  tank 20 (partial).
- 11 entries in the source register (`data/sources.csv`).
- Formats: Parquet (default config), JSONL with field-level provenance (`full` config), JSON with
  metadata envelope, CSV, source register CSV, SHA-256 checksums.
- Release validation: all 29 automated structural and cross-format checks pass.

## Planned for a future version (not in 1.0.0)

- Pallet-wide containers, standard-height and genset reefers, fixed-end flat racks, ventilated and
  bulk containers, and tank capacities and weights, once sources are found.
