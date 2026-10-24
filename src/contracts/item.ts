import { z } from 'zod';

export const ItemSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().min(1).max(100),
  quantity: z.number().int().nonnegative(),
});
export const ItemResponseSchema = z.strictObject({ data: ItemSchema });
export const ItemListResponseSchema = z.strictObject({ data: z.array(ItemSchema) });
export const ErrorResponseSchema = z.strictObject({
  error: z.strictObject({ code: z.string().min(1), message: z.string().min(1) }),
});
export type Item = z.infer<typeof ItemSchema>;
export type NewItem = Pick<Item, 'name' | 'quantity'>;
