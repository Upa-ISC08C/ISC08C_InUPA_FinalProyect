import { z } from "zod";

export const createConnectionSchema = z.object({
  body: z.object({
    following_id: z.string().uuid("El ID de la persona a seguir debe ser un UUID válido"),
  }),
});

export const connectionFiltersSchema = z.object({
  query: z.object({
    follower_id: z.string().uuid().optional(),
    following_id: z.string().uuid().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const connectionIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});

