# ShipContainerX release validation

Dataset ShipContainerX v1.0.0, 17 records, checked 2026-10-18. 29 of 29 checks pass.

> These are automated format and consistency checks. They do not independently re-verify the research.

| Result | Check | Details |
|---|---|---|
| PASS | JSON record_count (17) equals the number of records |  |
| PASS | JSONL line count equals record_count |  |
| PASS | CSV row count equals record_count |  |
| PASS | Parquet row count equals record_count |  |
| PASS | id values are unique |  |
| PASS | id is lower-case letters, digits and hyphens |  |
| PASS | ISO size-type codes are unique |  |
| PASS | ISO size-type code is 4 characters (letters and digits) |  |
| PASS | Required fields present: id, name, category, iso_type_group, height_class, nominal_length_ft, external_length_mm, external_width_mm, research_status, source_ids |  |
| PASS | Every JSON record has the same fields in the same order |  |
| PASS | CSV columns equal the JSON fields minus fields_detail |  |
| PASS | Parquet columns equal the CSV columns |  |
| PASS | category is in the published vocabulary |  |
| PASS | research_status is VERIFIED or PARTIAL |  |
| PASS | JSONL records are deep-equal to JSON records |  |
| PASS | Every CSV cell matches the JSON value (lists joined with "; ") |  |
| PASS | Every Parquet value matches the JSON value |  |
| PASS | max_payload_kg = max_gross_kg minus tare_kg |  |
| PASS | Inside dimensions are smaller than the outside dimensions |  |
| PASS | capacity_m3 is within 5% of length x width x height |  |
| PASS | source_id values are unique |  |
| PASS | Every source_ids entry exists in sources.csv |  |
| PASS | fields_detail values equal the record values and cite registered sources |  |
| PASS | Every confidence is CONFIRMED, STRONG or SUPPORTED (or empty for definitions) |  |
| PASS | Every field with a confidence cites at least one source |  |
| PASS | Every typical_cargo entry has a reason and a source |  |
| PASS | Every registered source is cited by at least one record |  |
| PASS | shipcontainerx_full.parquet equals the JSONL records (nulls ignored) |  |
| PASS | sources.parquet equals sources.csv |  |
