# API test strategy

## Purpose

Demonstrate maintainable REST API automation against a deterministic in-memory local service.

## Coverage

- Availability: /health, JSON content-type, metadata.
- Functional: POST/GET/PUT/PATCH/DELETE and list.
- Security behavior: missing or invalid bearer token (401); read-only token (403).
- Negative: invalid JSON (400), nonexistent ID (404), invalid input (422).
- Contracts: strict Zod response shapes.

## Reliability

- Local service started automatically by Playwright.
- No external network API or credentials.
- Each CRUD scenario owns and deletes its records.
- Two CI workers, one retry on CI, HTML report artifacts.
- No browser binaries needed for HTTP-only testing.

## Limitations

Mock API behavior is implemented in the same repository as tests. This validates the testing architecture and mock contract but **does not** validate production API integrations, OAuth, rate limiting, database consistency, or real service security.

## Next

Integrate a dedicated non-production API with controlled credentials, seeded data, and OpenAPI specifications. Generate a dependency lockfile for reproducible CI.
