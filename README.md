# API Automation Testing Assessment - Online Bookstore

Automated API test suite using Playwright for FakeRestAPI Books and Authors endpoints.

## Project Structure

```text
api-test/
|- helpers/
|  `- api.helpers.ts
|- tests/
|  |- books.spec.ts
|  `- authors.spec.ts
|- .github/workflows/
|  `- api-tests.yml
|- Dockerfile
|- playwright.config.ts
|- tsconfig.json
|- package.json
`- README.md
```

## Setup

```bash
npm install
```

## Run Tests Locally

```bash
npm test
npm run test:books
npm run test:authors
npm run test:report
```

## Configuration

Use environment variable `BASE_URL` to target another environment.

PowerShell:

```bash
$env:BASE_URL="https://staging.myapi.com"; npm test
```

Bash:

```bash
BASE_URL=https://staging.myapi.com npm test
```

## Docker

Build and run tests in a container:

```bash
docker build -t api-automation-tests .
docker run --rm -e BASE_URL=https://fakerestapi.azurewebsites.net api-automation-tests
```

The container executes the full API test suite on startup.

## CI/CD Pipeline

GitHub Actions workflow is included at `.github/workflows/api-tests.yml`.

Pipeline steps:
- Build Docker image
- Run tests inside Docker container
- Generate Playwright HTML report
- Upload HTML report as an artifact

## Test Coverage

### Books API

| Endpoint | Scenarios |
|---|---|
| `GET /api/v1/Books` | 200 + list shape, Content-Type header |
| `GET /api/v1/Books/{id}` | 200 valid ID, 404 missing, 400 invalid/negative |
| `POST /api/v1/Books` | 200 created, echo fields, 400 empty/malformed, 0-pageCount edge case |
| `PUT /api/v1/Books/{id}` | 200 updated, 404 missing, 400 invalid ID, 400 empty body, mismatched ID |
| `DELETE /api/v1/Books/{id}` | 200 valid, 404 missing, 400 invalid ID, idempotency |
| Performance | GET + POST within 3s |

### Authors API (Bonus)

| Endpoint | Scenarios |
|---|---|
| `GET /api/v1/Authors` | 200 + list shape, Content-Type header |
| `GET /api/v1/Authors/{id}` | 200 valid ID, 404 missing, 400 invalid, linked book ID check |
| `POST /api/v1/Authors` | 200 created, echo fields, 400 empty body, special character names |
| `PUT /api/v1/Authors/{id}` | 200 updated, 404 missing, 400 invalid ID, 400 empty body |
| `DELETE /api/v1/Authors/{id}` | 200 valid, 404 missing, 400 invalid ID, idempotency |
| Performance | GET within 3s |

## Key Design Decisions

- **`api.helpers.ts`** centralises all request calls and payload factories — changing a base path or adding auth headers only needs one file edit.
- **`makeBook()` / `makeAuthor()`** factories accept partial overrides, keeping tests DRY while staying readable.
- **`assertBookShape()` / `assertAuthorShape()`** use `toMatchObject` with `expect.any(Type)` so tests stay resilient to value changes while still verifying structure.
- **Flexible status code assertions** (e.g. `expect([400, 404]).toContain(...)`) accommodate APIs that vary slightly in error handling, avoiding brittle test failures.
- `BASE_URL` is externalized via environment variable for environment portability.
