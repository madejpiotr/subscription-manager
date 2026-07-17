import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}

// Rozszerzamy typ Request, żeby TypeScript wiedział o req.userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Brak autoryzacji" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token!, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = payload.userId;
    next(); // przepuszczamy dalej, do właściwego endpointu
  } catch (error) {
    return res.status(401).json({ error: "Nieprawidłowy lub wygasły token" });
  }
};