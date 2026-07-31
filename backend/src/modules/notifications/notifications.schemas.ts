import { z } from "zod";

export const notificationFiltersSchema = z.object({
  query: z.object({
    soloNoLeidas: z.enum(["true", "false"]).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});

export const notificationIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID debe ser un UUID válido"),
  }),
});

