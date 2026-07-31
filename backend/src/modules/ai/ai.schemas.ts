import { z } from "zod";

export const textPromptSchema = z.object({
  body: z.object({
    texto: z.string().min(10, "El texto es muy corto para ser procesado").max(10000, "El texto es demasiado largo"),
  }),
});

