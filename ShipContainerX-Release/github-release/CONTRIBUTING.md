# Contributing to ShipContainerX

Thank you for helping improve an open dataset of container types. The most valuable contributions
are **corrections and additions backed by a public source**.

## Ways to contribute

| You want to... | Do this |
|---|---|
| Fix a wrong value (dimension, weight, ISO code, cargo suitability) | Open a **Data correction** issue. |
| Add a container type that is missing | Open a **Missing container type** issue. |
| Report a problem with files, docs, scripts or the API | Open a **Documentation or tooling** issue. |

## What makes a good report

- The `id` (for example `40-hc-dry`), the field, the current value and the value you believe is correct.
- **A public source**: ideally the manufacturer or carrier specification (a booklet, a product page,
  a brochure) or the ISO standard itself. Say which series or manufacturer the figure belongs to,
  because specifications differ between series.
- For a new type: the ISO 6346 size-type code, the dimensions and weights, and where they are published.

Please quote figures, not source text. Never estimate a value a source does not state.

## How corrections are made

The data files are generated from the maintainer's research records, so please report changes as
issues rather than editing `data/` directly. The maintainer checks the source, updates the
research record and releases a new version of the files.

## Conduct

Be respectful and assume good faith. Where credible sources disagree, the dataset records the
range in the notes rather than picking a side.
