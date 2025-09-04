import { z } from 'zod';

export const filtersSchema = z.object({
  email: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
});

export type FiltersType = z.infer<typeof filtersSchema>;