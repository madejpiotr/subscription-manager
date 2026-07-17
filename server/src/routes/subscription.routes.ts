import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createSubscription, getSubscriptions, updateSubscription, deleteSubscription } from "../controllers/subscription.controller.js";
const router = Router();

router.use(requireAuth); // wszystkie endpointy w tym pliku wymagają zalogowania

router.post("/", createSubscription);
router.get("/", getSubscriptions);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

export default router;