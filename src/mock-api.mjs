import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const items = new Map();
const port = Number(process.env.PORT || 4317);

function json(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(payload));
}
function error(res, status, code, message) {
  json(res, status, { error: { code, message } });
}
function validItem(body, partial = false) {
  if (body === null || Array.isArray(body) || typeof body !== 'object') return false;
  const keys = Object.keys(body);
  if (keys.some(key => !['name', 'quantity'].includes(key))) return false;
  if (!partial && (!keys.includes('name') || !keys.includes('quantity'))) return false;
  if (partial && keys.length === 0) return false;
  if ('name' in body && (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 100)) return false;
  if ('quantity' in body && (!Number.isInteger(body.quantity) || body.quantity < 0)) return false;
  return true;
}
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64 * 1024) {
      const e = new Error('Request body too large'); e.status = 413; throw e;
    }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { const e = new Error('Invalid JSON'); e.status = 400; throw e; }
}
const server = createServer(async (req, res) => {
  const method = req.method ?? 'GET';
  const url = new URL(req.url ?? '/', 'http://localhost');
  if (url.pathname === '/health' && method === 'GET') {
    return json(res, 200, { status: 'ok', service: 'admiralcoder-mock-api' });
  }
  if (!url.pathname.startsWith('/v1/items')) return error(res, 404, 'NOT_FOUND', 'Route not found');
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  if (!['local-test-token', 'readonly-test-token'].includes(token)) {
    return error(res, 401, 'UNAUTHORIZED', 'Valid bearer token required');
  }
  if (!['GET', 'HEAD'].includes(method) && token === 'readonly-test-token') {
    return error(res, 403, 'FORBIDDEN', 'Token has read-only access');
  }
  const match = url.pathname.match(/^\/v1\/items(?:\/([a-f0-9-]+))?$/);
  if (!match) return error(res, 404, 'NOT_FOUND', 'Route not found');
  const id = match[1];
  try {
    if (method === 'GET' && !id) return json(res, 200, { data: [...items.values()] });
    if (method === 'GET' && id) {
      const item = items.get(id);
      return item ? json(res, 200, { data: item }) : error(res, 404, 'NOT_FOUND', 'Item not found');
    }
    if (method === 'POST' && !id) {
      const body = await readBody(req);
      if (!validItem(body)) return error(res, 422, 'VALIDATION_ERROR', 'name and quantity are required');
      const item = { id: randomUUID(), name: body.name.trim(), quantity: body.quantity };
      items.set(item.id, item);
      res.setHeader('location', `/v1/items/${item.id}`);
      return json(res, 201, { data: item });
    }
    if (['PUT', 'PATCH'].includes(method) && id) {
      const existing = items.get(id);
      if (!existing) return error(res, 404, 'NOT_FOUND', 'Item not found');
      const body = await readBody(req);
      if (!validItem(body, method === 'PATCH')) return error(res, 422, 'VALIDATION_ERROR', 'Invalid item fields');
      const item = { ...existing, ...body, name: 'name' in body ? body.name.trim() : existing.name };
      items.set(id, item);
      return json(res, 200, { data: item });
    }
    if (method === 'DELETE' && id) {
      if (!items.has(id)) return error(res, 404, 'NOT_FOUND', 'Item not found');
      items.delete(id);
      res.writeHead(204);
      return res.end();
    }
    return error(res, 405, 'METHOD_NOT_ALLOWED', 'Method not supported');
  } catch (e) {
    return error(res, e.status ?? 500, e.status === 400 ? 'INVALID_JSON' : 'REQUEST_ERROR', e.message ?? 'Unexpected error');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Mock API listening on http://127.0.0.1:${port}`));
