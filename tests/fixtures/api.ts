import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../../src/client/ApiClient.js';

type Fixtures = { api: ApiClient };
export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => { await use(new ApiClient(request)); },
});
export { expect };
