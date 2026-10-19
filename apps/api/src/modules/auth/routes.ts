import bcrypt from "bcryptjs";
import { Router } from "express";
import { loginSchema, registerSchema } from "@codementor/shared";
import { prisma } from "../../config/prisma.js";
import { asyncRoute, HttpError, signToken } from "../../middleware/http.js";

export const authRouter = Router();

function publicUser(user: { id: string; email: string; displayName: string; createdAt: Date }) {
  return { id: user.id, email: user.email, displayName: user.displayName, createdAt: user.createdAt };
}

function respond(res: { setHeader: (name: string, value: string) => void; json: (body: unknown) => void }, user: { id: string; email: string; displayName: string; createdAt: Date }) {
  const token = signToken(user.id);
  res.setHeader(
    "Set-Cookie",
    `token=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`,
  );
  res.json({ token, user: publicUser(user) });
}

authRouter.post(
  "/register",
  asyncRoute(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const email = body.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "An account with that email already exists.", "EMAIL_TAKEN");
    const user = await prisma.user.create({
      data: {
        email,
        displayName: body.displayName,
        passwordHash: await bcrypt.hash(body.password, 10),
      },
    });
    respond(res, user);
  }),
);

authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    const matches = user ? await bcrypt.compare(body.password, user.passwordHash) : false;
    if (!user || !matches) throw new HttpError(401, "Invalid email or password.", "INVALID_LOGIN");
    respond(res, user);
  }),
);
