import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { runDailyReminders, runWeeklyDigest } from "../jobs/reminderJob.js";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});

router.post("/register", register);
router.post("/login", login);

router.post("/test-reminders", requireAuth, async (req, res) => {
  await runDailyReminders();
  res.json({ message: "Sprawdzono przypomnienia" });
});

router.post("/test-digest", requireAuth, async (req, res) => {
  await runWeeklyDigest();
  res.json({ message: "Wysłano podsumowania" });
});

export default router;