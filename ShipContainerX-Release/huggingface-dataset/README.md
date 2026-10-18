---
pretty_name: ShipContainerX
language:
  - en
license: cc-by-4.0
size_categories:
  - n<1K
tags:
  - shipping
  - containers
  - logistics
  - maritime
  - iso-6346
  - freight
  - provenance
configs:
  - config_name: default
    default: true
    data_files:
      - split: train
        path: data/shipcontainerx.parquet
  - config_name: full
    data_files:
      - split: train
        path: data/shipcontainerx_full.parquet
  - config_name: sources
    data_files:
      - split: train
        path: data/sources.parquet
---

# ShipContainerX: an open dataset of ISO container types (v1.0.0)

ShipContainerX describes the standard shipping container types: inside and outside dimensions,
door and roof openings, tare, maximum gross and payload weights, capacity, ISO 6346 size-type
codes, reefer temperature ranges and the cargo each type suits. Every value carries its source
and a confidence level.

| | |
|---|---|
| **Dataset version** | 1.0.0 |
| **Generated** | 2026-10-17 |
| **Release package prepared** | 2026-10-18 |
| **Records** | 17 container types: 16 `VERIFIED`, 1 `PARTIAL` (the 20ft tank) |
| **Categories** | dry 4, reefer 2, open top 3, hardtop 3, flat rack 2, platform 2, tank 1 |
| **Source register** | 11 sources |
| **License** | CC BY 4.0 |

> **Representative values, not a manufacturer catalogue.** Figures come from one representative
> series of the carriers' fleets. Individual containers vary by manufacturer and series; ranges
> are in the `notes` of `fields_detail`. Always check the box you are actually using.

## Configurations and files

| Config | File | Rows | Use it for |
|---|---|---|---|
| `default` | `data/shipcontainerx.parquet` | 17 | Flat table (33 columns) for pandas, Polars and DuckDB. |
| `full` | `data/shipcontainerx_full.parquet` | 17 | Same records plus the nested `fields_detail` (value, confidence, sources and notes per field) and a structured `typical_cargo`. |
| `sources` | `data/sources.parquet` | 11 | The source register that `source_ids` point to. |

The `full` and `sources` Parquet files are lossless conversions of `data/shipcontainerx.jsonl` and
`data/sources.csv` (the `datasets` library requires one file format across configs); the release
validation checks them value by value against the originals. The originals are included too:

- `data/shipcontainerx.jsonl`: one JSON record per line, with `fields_detail`.
- `data/shipcontainerx.json`: all records in one document with a metadata envelope.
- `data/shipcontainerx.csv`: CSV twin of the default table (lists joined with `; `).
- `data/sources.csv`: the source register as CSV.
- `data/SHA256SUMS`: checksums of the five original files.

## Loading

```python
from datasets import load_dataset

containers = load_dataset("xexflare/shipcontainerx", split="train")          # flat (Parquet)
full = load_dataset("xexflare/shipcontainerx", "full", split="train")        # with fields_detail
sources = load_dataset("xexflare/shipcontainerx", "sources", split="train")

reefers = containers.filter(lambda r: r["category"] == "reefer")
```

```python
import pandas as pd

df = pd.read_parquet("hf://datasets/xexflare/shipcontainerx/data/shipcontainerx.parquet")
big = df[df["max_payload_kg"] > 28000][["id", "iso_size_type", "max_payload_kg", "capacity_m3"]]
```

## Intended use

- Container-fit, load-planning and freight calculators that need real internal dimensions and payloads.
- Teaching and analysis: what each container type is for, and how its figures differ.
- A cited starting point for checking carrier or lessor specifications.

**Not suitable** as the only basis for stowage plans, weight declarations or safety-critical
decisions. Use the specification of the actual container and the regulations that apply.

## Schema

One record per container type. Lengths in millimetres, weights in kilograms, volumes in cubic
metres, temperatures in Celsius. Missing values are `null` (empty in CSV).

**Identity:** `id` (stable, e.g. `40-hc-dry`), `name`, `category` (`dry`, `reefer`, `open_top`,
`hardtop`, `flat_rack`, `platform`, `tank`), `iso_size_type` (ISO 6346 code, e.g. `45G1`),
`iso_type_group`, `height_class`, `nominal_length_ft`.

**Dimensions:** `external_length_mm`, `external_width_mm`, `external_height_mm` (ISO 668 nominal),
`internal_length_mm`, `internal_width_mm`, `internal_height_mm`, `max_stow_height_mm` (reefers),
`door_width_mm`, `door_height_mm`, `roof_opening_length_mm`, `roof_opening_width_mm`,
`deck_height_mm` (flat racks and platforms), `capacity_m3`.

**Weights:** `max_gross_kg`, `tare_kg`, `max_payload_kg` (= max gross minus tare).

**Reefers:** `temperature_min_c`, `temperature_max_c`, `power_supply`.

**Other:** `floor`, `special_features`, `typical_cargo` (cargo categories with the reason and source;
joined with `; ` in CSV and the default table).

**Provenance:** `research_status`, `last_verified`, `source_ids`, `record_path`, and in the `full`
config `fields_detail`.

Full field reference: `SCHEMA.md` in the GitHub repository (https://github.com/XexFlare/shipcontainerx).

## Confidence levels

| Level | Meaning |
|---|---|
| `CONFIRMED` | A standard or definition, or stated explicitly by a primary source. |
| `STRONG` | Two sources agree. |
| `SUPPORTED` | One credible source. |
| (empty) | Definitional fields such as `name`, `category` and `nominal_length_ft`. |

Repetition across pages that copy one original never raises confidence.

## Collection methodology

1. Each container type is one research file with a table of fields, each with a value, confidence,
   source and notes, plus the typical cargo with the reason and source.
2. Representative values come from one series of the carrier's fleet (normally the first
   wooden-floor series in the Hapag-Lloyd booklet); ranges across series are in the notes.
3. Max payload is checked against max gross minus tare, capacity against the inside dimensions,
   and inside dimensions against the ISO 668 outside dimensions.
4. A build script turns the research files into these data files. The research files themselves
   are not published.

## Source attribution

`data/sources.csv` lists the 11 registered sources. The main source is Hapag-Lloyd's Container
Specification booklet (read in full), cross-checked against Hapag-Lloyd product pages and Ocean
Network Express's special cargo brochure. Some carrier pages refuse automated retrieval and were
read through search summaries; those are tier 2 sources and their records are marked accordingly.
Facts remain attributable to their original publishers; each source keeps its own terms.

## Validation and known limits

Automated validation (29 checks, all passing) confirmed: record counts match in every format;
`id` and ISO codes are unique; JSON and JSONL are deep-equal; every CSV and Parquet value matches
the JSON; max payload equals max gross minus tare; inside dimensions are smaller than outside;
capacity matches the inside dimensions within 5%; every cited source exists; the `full` and
`sources` Parquet files equal the originals. **These are consistency checks. They do not
independently re-verify the research.**

Known limits:

- The 20ft tank is `PARTIAL`: only codes, handling rules and cargo (no capacity or weights).
- Not covered yet: pallet-wide containers, standard-height and genset reefers, fixed-end flat
  racks, ventilated and bulk containers (codes appear in the sources, dimensions do not).
- On the 20ft reefer the door opening (2,290 mm) is wider than the inside width (2,280 mm,
  measured between the side linings). Both carrier sources state it; it is kept as published.
- The 20ft dry record uses the 32,500 kg rated series (30,200 kg payload). Older 30,480 kg series
  carry about 28,130 kg; the range is in the notes.
- Values are as of 2026-10-17.

## License

ShipContainerX is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): free to
share and adapt, including commercially, with attribution ("ShipContainerX v1.0.0"). Facts remain
attributable to their original sources, which keep their own terms.

## Citation

```bibtex
@misc{shipcontainerx_2026,
  title  = {ShipContainerX: an open, source-cited dataset of ISO container types},
  author = {{XexFlare}},
  year   = {2026},
  note   = {Version 1.0.0, generated 2026-10-17},
  url    = {https://huggingface.co/datasets/xexflare/shipcontainerx}
}
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md). **1.0.0** (generated 2026-10-17): first release, 17 types,
11 sources, CSV/JSON/JSONL/Parquet.
