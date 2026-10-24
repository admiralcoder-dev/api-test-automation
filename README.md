# AdmiralCoder — API Test Automation

[AdmiralCoder](https://admiralcoder.com) · [GitHub Organization](https://github.com/admiralcoder-dev)

A standalone **TypeScript + Playwright APIRequestContext + Zod** framework demonstrating reliable API test design, reusable clients, REST CRUD workflows, authentication and authorization, schema contracts, negative testing, and GitHub Actions.

> **Scope:** v0.1 validates a self-hosted, deterministic mock REST API. These tests do not establish that a real production API is correct. Integration with owned applications is a future enhancement.

## Quick start

Requires Node.js 22+.

```bash
npm install
npx playwright test
npm run typecheck
npm run report
```

The Playwright `webServer` configuration automatically starts the local mock API. **No browser installation is required** for APIRequestContext tests.

## Commands

| Command | Description |
| --- | --- |
| `npm test` | All API tests |
| `npm run test:smoke` | Health and core API smoke tests |
| `npm run test:contract` | Zod contract tests |
| `npm run test:negative` | Authentication and validation tests |
| `npm run typecheck` | TypeScript check |
| `npm run report` | Open Playwright HTML report |

## Architecture

```text
src/mock-api.mjs            Deterministic in-memory HTTP REST service
src/client/ApiClient.ts     Typed reusable API client
src/contracts/item.ts      Zod response contracts
tests/fixtures/api.ts      Playwright fixture for the client
tests/health.spec.ts       Availability and response metadata
tests/items.spec.ts        CRUD, isolation, status codes
tests/auth.spec.ts         401, 403, malformed and invalid requests
tests/contracts.spec.ts    Strict response shape checks
playwright.config.ts       API test configuration and local server
.github/workflows/api.yml  CI checks and HTML report artifacts
docs/TEST_STRATEGY.md      Coverage, isolation, limitations
```

## Test design principles

- Use a controlled local server rather than a rate-limited third-party API.
- Each CRUD test creates its own records and cleans them up.
- Assert HTTP status, headers, response body and contract where appropriate.
- Keep negative tests explicit and deterministic.
- Avoid storing real credentials, customer data, or child records.
- Report failures with Playwright HTML and CI artifacts.

## Roadmap

- [x] Framework structure and local API fixture
- [x] REST CRUD and negative-test suites
- [x] Response contract validation with Zod
- [x] GitHub Actions workflow
- [ ] Validate workflow and merge into main
- [ ] Commit dependency lockfile and switch CI to `npm ci`
- [ ] Add real-service integration tests using isolated test environments
- [ ] Add OpenAPI contract coverage and data-driven scenarios

MIT licensed; see [LICENSE](LICENSE).
