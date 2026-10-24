import { test, expect } from './fixtures/api.js';
import { ErrorResponseSchema, ItemResponseSchema } from '../src/contracts/item.js';

test('created item follows strict Zod contract @contract', async ({ api }) => {
  const created = await api.create({ name: 'schema-check', quantity: 0 });
  expect(created.status()).toBe(201);
  const item = ItemResponseSchema.parse(await created.json()).data;
  try {
    expect(item.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(item.quantity).toBe(0);
  } finally {
    expect((await api.remove(item.id)).status()).toBe(204);
  }
});

test('validation errors follow strict Zod contract @contract', async ({ api }) => {
  const response = await api.create({ quantity: 'not-a-number' });
  expect(response.status()).toBe(422);
  expect(ErrorResponseSchema.parse(await response.json()).error.code).toBe('VALIDATION_ERROR');
});
