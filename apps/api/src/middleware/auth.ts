import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { HttpError, readUserId } from "./http.js";

export type AuthedRequest = Request & { userId: string };

function tokenFrom(req: Request): string | null {
  const header = req.header("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  const cookie = req.header("cookie");
  if (!cookie) return null;
  for (const part of cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === "token") return decodeURIComponent(rest.join("="));
  }
  return null;
}

export async function requireUser(req: Request, _res: Response, next: NextFunction) {
  const token = tokenFrom(req);
  const userId = token ? readUserId(token) : null;
  if (!userId) {
    next(new HttpError(401, "Sign in to continue.", "UNAUTHENTICATED"));
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    next(new HttpError(401, "Sign in to continue.", "UNAUTHENTICATED"));
    return;
  }
  (req as AuthedRequest).userId = user.id;
  next();
}
