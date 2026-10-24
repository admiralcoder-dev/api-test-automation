import { test, expect } from './fixtures/api.js';

test('health endpoint responds with service metadata @smoke', async ({ api }) => {
  const response = await api.health();
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(await response.json()).toEqual({ status: 'ok', service: 'admiralcoder-mock-api' });
});

test('unauthenticated API requests are rejected @negative', async ({ request }) => {
  const response = await request.get('/v1/items');
  expect(response.status()).toBe(401);
  expect((await response.json()).error.code).toBe('UNAUTHORIZED');
});
