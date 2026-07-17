import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});

router.post("/register", register);
router.post("/login", login);

export default router;