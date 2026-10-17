# ShipContainerX v1.0.0: release package

The ShipContainerX API, built from `../Data` with the X dataset API template (ShipPortX,
`ShipPortX-Release/api/API_TEMPLATE.md`). Website, Hugging Face and GitHub packages are not built
yet; the API is what the tools need first.

| Folder | What it is |
|---|---|
| `api/` | Read-only JSON API (one Netlify Function) plus the usage-logging edge function, hourly rollup and private `/stats/` page |
| `scripts/build-api-data.mjs` | Writes `api/src/data/dataset.generated.mjs` from `../Data` |

## Endpoints

| Path | Description |
|---|---|
| `GET /api/health` | Status, version, record count (never cached) |
| `GET /api/v1/containers` | List and filter: `q`, `category` (`dry`, `reefer`, `open_top`, `hardtop`, `flat_rack`, `platform`, `tank`), `cargo` (comma separated, all must match), `length_ft` (20, 40, 45), `high_cube`, `min_payload_kg`, `min_capacity_m3`, `page`, `limit` (max 100) |
| `GET /api/v1/containers/index` | Every type as compact rows (`fields` + `data`), `category` filter |
| `GET /api/v1/containers/{id}` | One type by id (`40-hc-dry`) or ISO size-type code (`45G1`), with `fields_detail` (confidence, sources, notes per value) and resolved `sources` |
| `GET /api/v1/cargo` | Cargo categories with the container types that suit them and why; `q` filter |
| `GET /api/v1/metadata` | Version, licence, vocabularies, statistics, source register |
| `GET /api/stats` | Private usage summary (bearer `STATS_TOKEN`) |

Every endpoint accepts `client=<app name>`. Errors, caching, CORS and usage logging behave as in
the ShipPortX API (see the template).

## Rebuild and check

```bash
cd api && npm install && cd ..
npm run release   # build_dataset.py -> build-api-data -> 26 API tests -> bundle check
```

`build_dataset.py` writes Parquet only when `pandas` and `pyarrow` are installed.

## Deploy (needs the maintainer's Netlify account)

1. New Netlify site, Base directory `ShipContainerX-Release/api` (uses `api/netlify.toml`).
2. Environment variables, same values as the ShipPortX API: `FIREBASE_SERVICE_ACCOUNT`, `STATS_TOKEN`.
   Without them the API serves data and logs nothing.
3. The Firestore TTL policy on collection group `calls` (field `expireAt`) is shared by all
   dataset APIs: set it once per project.
4. Check `/api/health` and `/api/v1/containers?client=deploy-check`.
