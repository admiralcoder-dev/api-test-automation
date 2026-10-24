import { randomUUID } from 'node:crypto';
import { test, expect } from './fixtures/api.js';
import { ItemResponseSchema, ItemListResponseSchema } from '../src/contracts/item.js';

test('create, retrieve and delete an item @smoke', async ({ api }) => {
  const name = `qa-${randomUUID()}`;
  const created = await api.create({ name, quantity: 3 });
  expect(created.status()).toBe(201);
  const item = ItemResponseSchema.parse(await created.json()).data;
  expect(item).toMatchObject({ name, quantity: 3 });
  expect(created.headers().location).toBe(`/v1/items/${item.id}`);
  try {
    const found = await api.get(item.id);
    expect(found.status()).toBe(200);
    expect(ItemResponseSchema.parse(await found.json()).data).toEqual(item);
  } finally {
    expect((await api.remove(item.id)).status()).toBe(204);
  }
  expect((await api.get(item.id)).status()).toBe(404);
});

test('PUT replaces and PATCH partially updates @smoke', async ({ api }) => {
  const created = await api.create({ name: 'before', quantity: 1 });
  expect(created.status()).toBe(201);
  const id = ItemResponseSchema.parse(await created.json()).data.id;
  try {
    const put = await api.replace(id, { name: 'after', quantity: 5 });
    expect(put.status()).toBe(200);
    expect(ItemResponseSchema.parse(await put.json()).data).toMatchObject({ id, name: 'after', quantity: 5 });
    const patch = await api.patch(id, { quantity: 9 });
    expect(patch.status()).toBe(200);
    expect(ItemResponseSchema.parse(await patch.json()).data).toMatchObject({ id, name: 'after', quantity: 9 });
  } finally {
    expect((await api.remove(id)).status()).toBe(204);
  }
});

test('GET list response is contract-valid @contract', async ({ api }) => {
  const response = await api.list();
  expect(response.status()).toBe(200);
  ItemListResponseSchema.parse(await response.json());
});
