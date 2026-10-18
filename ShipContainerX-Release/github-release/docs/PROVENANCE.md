# Provenance and methodology

## How a record is made

Each container type is one research record: a table of fields, each with a **value**, a
**confidence**, one or more **sources** and optional **notes**, plus the typical cargo with the
reason and a source. A build script turns the records into the data files. The research records
are not published; the data files carry the same information (`fields_detail` in JSON and JSONL).

## Representative values

Carriers publish several series of the same container type. Each record uses one representative
series (normally the first wooden-floor series in the Hapag-Lloyd booklet). Ranges across series
and differences between sources are written in the `notes` of the field. Example: the 20ft dry
record uses the 32,500 kg rated series (30,200 kg payload); an older 30,480 kg series carries about
28,130 kg.

## Confidence levels

| Level | Meaning |
|---|---|
| `CONFIRMED` | A standard or definition (ISO 668, ISO 6346), or stated explicitly by a primary source. |
| `STRONG` | Two sources agree. |
| `SUPPORTED` | One credible source. |
| (empty) | Definitional fields: `name`, `category`, `nominal_length_ft`, `height_class`. |

Repetition across pages that copy one original never raises confidence.

## Source tiers

| Tier | Meaning |
|---|---|
| 1 | The publisher's own primary document, read in full (a technical booklet or brochure). |
| 2 | The publisher's own web page, read through a search summary because the page refused automated retrieval. |
| 3 | Trade press. |
| 4 | Encyclopedia (discovery only). |

v1.0.0 uses 2 tier 1 sources and 9 tier 2 sources. The register is `data/sources.csv`:
`source_id`, `title`, `url`, `type`, `tier`, `accessed`, `establishes`.

| Source | What it gives |
|---|---|
| HL-01 Hapag-Lloyd, Container Specification booklet | Inside dimensions, openings, weights and capacity per series for most types; reefer ranges; ISO 668 and ISO 6346 tables. Primary source. |
| HL-02 to HL-10 Hapag-Lloyd product pages | Cross-checks for dry, high cube, 45ft, reefer, open top and hardtop types. |
| ONE-01 Ocean Network Express, Special Cargo brochure (May 2023) | Flat rack figures and typical special cargo. |

## Checks applied when the data is built

- `max_payload_kg` equals `max_gross_kg` minus `tare_kg`.
- Inside dimensions are smaller than the ISO 668 outside dimensions.
- Capacity is consistent with the inside dimensions.
- ISO 6346 codes are well formed and unique.
- Every cited source exists in the register, and every cargo suitability has a reason and a source.

## What is not done

The build checks the files against each other and against these rules. It does not compare the
figures with a second independent edition of each source, and carrier pages that refused
automated retrieval were read through search summaries (tier 2).
