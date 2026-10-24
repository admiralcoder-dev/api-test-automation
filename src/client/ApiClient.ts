import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { NewItem } from '../contracts/item.js';

export class ApiClient {
  constructor(private readonly request: APIRequestContext, private readonly token = 'local-test-token') {}

  private headers() { return { authorization: `Bearer ${this.token}` }; }

  health(): Promise<APIResponse> { return this.request.get('/health'); }
  list(): Promise<APIResponse> { return this.request.get('/v1/items', { headers: this.headers() }); }
  get(id: string): Promise<APIResponse> { return this.request.get(`/v1/items/${id}`, { headers: this.headers() }); }
  create(body: unknown): Promise<APIResponse> {
    return this.request.post('/v1/items', { headers: this.headers(), data: body });
  }
  replace(id: string, body: NewItem): Promise<APIResponse> {
    return this.request.put(`/v1/items/${id}`, { headers: this.headers(), data: body });
  }
  patch(id: string, body: Partial<NewItem>): Promise<APIResponse> {
    return this.request.patch(`/v1/items/${id}`, { headers: this.headers(), data: body });
  }
  remove(id: string): Promise<APIResponse> {
    return this.request.delete(`/v1/items/${id}`, { headers: this.headers() });
  }
}
