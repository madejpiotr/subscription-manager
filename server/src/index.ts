import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import cron from "node-cron";
import { runDailyReminders, runWeeklyDigest } from "./jobs/reminderJob.js";
import settingsRoutes from "./routes/settings.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/settings", settingsRoutes);
const PORT = process.env.PORT || 3000;

// Codziennie o 9:00 - sprawdź zbliżające się płatności
cron.schedule("0 9 * * *", runDailyReminders);

// W każdy poniedziałek o 8:00 - cotygodniowe podsumowanie
cron.schedule("0 8 * * 1", runWeeklyDigest);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

