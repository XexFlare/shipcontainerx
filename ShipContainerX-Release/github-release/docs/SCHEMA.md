# ShipContainerX schema (v1.0.0)

One record per container type. Files: `Data/shipcontainerx.json` (envelope with metadata),
`.jsonl`, `.csv`, `.parquet` and `Data/sources.csv`. Missing values are `null` (empty in CSV).
All lengths in millimetres, weights in kilograms, volumes in cubic metres, temperatures in Celsius.

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Stable id, e.g. `40-hc-dry` |
| `name` | string | Plain-language name |
| `category` | string | `dry`, `reefer`, `open_top`, `hardtop`, `flat_rack`, `platform`, `tank` |
| `iso_size_type` | string | ISO 6346 size-type code, e.g. `45G1` |
| `iso_type_group` | string | ISO 6346 type group, e.g. `45GP` |
| `height_class` | string | `standard (8ft 6in)`, `high cube (9ft 6in)` or `platform` |
| `nominal_length_ft` | integer | 20, 40 or 45 |
| `external_length_mm`, `external_width_mm`, `external_height_mm` | integer | ISO 668 nominal outside dimensions (platform: deck length and width) |
| `internal_length_mm`, `internal_width_mm`, `internal_height_mm` | integer | Inside dimensions (flat racks: between corner posts, floor to top) |
| `max_stow_height_mm` | integer | Reefers: maximum loading height (load line) |
| `door_width_mm`, `door_height_mm` | integer | Door opening |
| `roof_opening_length_mm`, `roof_opening_width_mm` | integer | Open top and hardtop roof opening |
| `deck_height_mm` | integer | Flat racks and platforms: height of the bottom structure |
| `max_gross_kg` | integer | Maximum gross weight (box plus cargo) |
| `tare_kg` | integer | Empty weight |
| `max_payload_kg` | integer | Maximum cargo weight = max gross minus tare |
| `temperature_min_c`, `temperature_max_c` | integer | Reefers: fleet temperature range |
| `capacity_m3` | number | Inside volume |
| `floor`, `power_supply`, `special_features` | string | Construction and handling notes |
| `typical_cargo` | array | `{ category, why, source_ids }`; CSV joins the categories with `; ` |
| `research_status` | string | `VERIFIED` or `PARTIAL` (some fields still to research) |
| `last_verified` | date | |
| `source_ids` | array | Every source cited in the record; CSV joins with `; ` |
| `record_path` | string | Research file the record was built from |
| `fields_detail` | object | JSON and JSONL only: per field `{ value, confidence, source_ids, notes }` |

Confidence: `CONFIRMED` (standard, or stated explicitly by a primary source), `STRONG` (two
sources agree), `SUPPORTED` (one source).

Values are representative series of carrier fleets. Individual containers vary by manufacturer
and series; ranges are in `fields_detail.<field>.notes`.
