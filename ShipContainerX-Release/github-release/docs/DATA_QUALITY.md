# Data quality

## Automated validation

`npm run validate` (`scripts/validate.mjs`) runs structural and consistency checks on `data/`:

- record counts match the metadata in JSON, JSONL, CSV and Parquet;
- `id` and ISO size-type codes are unique and well formed;
- required fields are present, and every record has the same fields in the same order;
- JSONL equals JSON; every CSV and Parquet value equals the JSON value;
- `max_payload_kg` equals `max_gross_kg` minus `tare_kg`;
- inside dimensions are smaller than outside dimensions;
- `capacity_m3` is within 5% of inside length x width x height;
- every `source_ids` entry exists in `sources.csv`, every confidence has a source, every typical
  cargo entry has a reason and a source, and every source is used;
- `SHA256SUMS` matches the files.

The report for this release is in `reports/release-validation-report.md`. **These are format and
consistency checks. They do not independently re-verify the research.**

## Known limits

- **The 20ft tank is partial.** Only the ISO type group, outside dimensions, handling rules and
  cargo are recorded. Capacity, tare and weights have no source yet.
- **Not covered:** pallet-wide containers, 40ft standard-height and genset reefers, fixed-end flat
  racks, ventilated and bulk containers. Their codes appear in the sources; dimensions do not.
- **Representative series.** One series per type. Values differ between manufacturers and years;
  see the notes in `fields_detail`.
- **20ft reefer door.** The door opening (2,290 mm) is wider than the inside width (2,280 mm,
  measured between the side linings). Both sources state it; it is kept as published.
- **Mixed source quality.** Nine of the 11 sources are carrier web pages read through search
  summaries (tier 2); the two primary documents (Hapag-Lloyd booklet, ONE brochure) were read in full.
- **Date.** Values are as of 2026-10-17.

## Reporting a problem

Open a **Data correction** issue with the `id`, the field and a public source. See
[CONTRIBUTING.md](../CONTRIBUTING.md).
