import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Sin esto, cualquier .transform()/.default() del esquema (normalizar
      // URLs, convertir query strings a numero, etc.) se calculaba pero se
      // tiraba: el controller seguia recibiendo el req.body/query original.
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as any;
      if (parsed.params !== undefined) req.params = parsed.params as any;
      return next();
    } catch (error) {
      return next(error); // El error de Zod pasara directo al errorHandler global
    }
  };
};

