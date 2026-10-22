# ShipContainerX HTTP API

A free, public, read-only JSON API over the v1.0.0 records in `data/`. No key, no sign-up; CORS
allows any origin. The API source code and deployment configuration are kept in a separate private repository.

**Credit:** "Container data: ShipContainerX (CC BY 4.0)".

Replace `<api-host>` with the deployed host.

## Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Status, dataset version and record count (never cached). |
| `GET /api/v1/containers` | Search, filter and paginate container types. |
| `GET /api/v1/containers/index` | Every type as compact rows (`fields` + `data`), for client-side use. Optional `category`. |
| `GET /api/v1/containers/{id}` | One type by id (`40-hc-dry`) or ISO size-type code (`45G1`), case-insensitive, with `fields_detail` and the resolved `sources`. |
| `GET /api/v1/cargo` | Cargo categories with the container types that suit them and why. Optional `q` filter. |
| `GET /api/v1/metadata` | Version, license, vocabularies, statistics and the source register. |

**`client` parameter:** every endpoint accepts `client=<your app name>` (letters, digits, `.`, `-`,
`_`, at most 40 characters). It never changes the response; it lets usage be told apart per app.
Please send it.

### `GET /api/v1/containers` parameters

| Parameter | Description |
|---|---|
| `q` | Case- and accent-insensitive search over name, id, ISO code, type group and category. |
| `category` | `dry`, `reefer`, `open_top`, `hardtop`, `flat_rack`, `platform` or `tank`. |
| `cargo` | Comma separated cargo categories, all must match (for example `frozen_goods`, `vehicles_and_boats`; the full list is at `/api/v1/cargo`). |
| `length_ft` | `20`, `40` or `45`. |
| `high_cube` | `true` or `false`. |
| `min_payload_kg` | Minimum max payload in kilograms (0 to 100000). Types without a payload figure are excluded. |
| `min_capacity_m3` | Minimum capacity in cubic metres (0 to 200). Types without a capacity are excluded. |
| `page`, `limit` | Default page 1; `limit` 1 to 100, default 25. |

## Response shape

```json
{
  "data": [ { "id": "20-reefer", "name": "20ft reefer container", "category": "reefer", "...": "..." } ],
  "meta": { "total": 2, "page": 1, "limit": 25, "total_pages": 1, "count": 2, "filters": { "category": "reefer" }, "dataset_version": "1.0.0", "credit": "Container data: ShipContainerX (CC BY 4.0)" },
  "links": { "self": "...", "first": "...", "last": "...", "prev": null, "next": null }
}
```

List records omit `fields_detail`; `GET /api/v1/containers/{id}` includes it.

## Errors

JSON with a machine-readable code, for example HTTP 404:

```json
{ "error": { "status": 404, "code": "container_not_found", "message": "No container type 'xyz'.", "details": { "id": "xyz", "hint": "..." } } }
```

Unknown query parameters are rejected with HTTP 400 (`unknown_parameter`) so typos do not silently return everything.

## Caching, limits and privacy

Responses are cacheable at the CDN. The API logs each call (time, endpoint, filters, `client`,
calling site, country, a bot flag). It does not store IP addresses, user agents or cookies. There
is no hard rate limit; please cache on your side and be reasonable.
