import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email i hasło są wymagane" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Hasło musi mieć min. 8 znaków" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Użytkownik z tym emailem już istnieje" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, createdAt: true }, // nigdy nie zwracamy hasha!
    });

    return res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Coś poszło nie tak" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email i hasło są wymagane" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Coś poszło nie tak" });
  }
};