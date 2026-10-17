# ShipContainerX

Open dataset of ISO container types: inside and outside dimensions, door and roof openings, tare,
max gross, max payload, capacity, ISO 6346 codes, reefer temperature ranges and the cargo each
type suits. Every value cites its source and confidence. Licence: CC BY 4.0.

**v1.0.0 (2026-10-17):** 17 types (16 verified, the 20ft tank partial): 20ft, 40ft, 40ft high
cube and 45ft high cube dry; 20ft and 40ft high cube reefer; 20ft, 40ft and 40ft high cube open
top and hardtop; 20ft and 40ft high cube flat rack; 20ft and 40ft platform; 20ft tank. Main
source: Hapag-Lloyd's Container Specification booklet, cross-checked against Hapag-Lloyd product
pages and Ocean Network Express's special cargo brochure.

| Path | Contents |
|---|---|
| `ShipContainerX-Research/ShipContainerX/` (separate local repo, not published) | Source of truth: one cited record per type, source register, unresolved items |
| `scripts/build_dataset.py` | Builds `Data/` and `reports/` (`python scripts/build_dataset.py`) |
| `Data/` | Published files: `shipcontainerx.json`, `.jsonl`, `.csv`, `.parquet`, `sources.csv` |
| `reports/` | Validation report and summary |
| `ShipContainerX-Release/` | The API (see its README) |
| `SCHEMA.md` | Field reference |

Tests: `python -m unittest discover scripts` and `npm test` in `ShipContainerX-Release/api`.

Not yet covered (tracked in the unpublished research repo, `unresolved.md`): pallet-wide containers, tank
capacities and weights, standard-height and genset reefers, fixed-end flat racks, ventilated and
bulk containers.
