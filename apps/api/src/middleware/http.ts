import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code = "ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new HttpError(500, "Authentication is not configured.", "CONFIG");
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

export function readUserId(token: string): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: { code: "VALIDATION", message: error.issues[0]?.message ?? "Invalid request." },
    });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  const tagged = error as { status?: number; code?: string; message?: string };
  if (tagged.status && tagged.message) {
    res.status(tagged.status).json({ error: { code: tagged.code ?? "ERROR", message: tagged.message } });
    return;
  }
  console.error(error);
  res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong." } });
}
