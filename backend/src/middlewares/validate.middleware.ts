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
      // aplicar transforms/defaults del schema (si no, el controller recibe el req.body sin transformar)
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as any;
      if (parsed.params !== undefined) req.params = parsed.params as any;
      return next();
    } catch (error) {
      return next(error); // El error de Zod pasara directo al errorHandler global
    }
  };
};

