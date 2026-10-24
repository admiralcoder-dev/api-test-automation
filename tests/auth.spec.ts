import { test, expect } from '@playwright/test';
import { ApiClient } from '../src/client/ApiClient.js';
import { ErrorResponseSchema } from '../src/contracts/item.js';

test('read-only token cannot create items @negative', async ({ request }) => {
  const api = new ApiClient(request, 'readonly-test-token');
  const response = await api.create({ name: 'denied', quantity: 1 });
  expect(response.status()).toBe(403);
  expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe('FORBIDDEN');
});

test('invalid bearer token returns 401 @negative', async ({ request }) => {
  const api = new ApiClient(request, 'invalid-token');
  const response = await api.list();
  expect(response.status()).toBe(401);
  expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe('UNAUTHORIZED');
});

test('invalid quantity is rejected with 422 @negative', async ({ request }) => {
  const api = new ApiClient(request);
  const response = await api.create({ name: 'invalid', quantity: -2 });
  expect(response.status()).toBe(422);
  expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe('VALIDATION_ERROR');
});

test('malformed JSON returns 400 @negative', async ({ request }) => {
  const response = await request.post('/v1/items', {
    headers: { authorization: 'Bearer local-test-token', 'content-type': 'application/json' },
    data: '{broken-json',
  });
  expect(response.status()).toBe(400);
  expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe('INVALID_JSON');
});

test('unknown item returns 404 @negative', async ({ request }) => {
  const api = new ApiClient(request);
  const response = await api.get('00000000-0000-4000-8000-000000000000');
  expect(response.status()).toBe(404);
  expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe('NOT_FOUND');
});
