import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const advanceBillingDate = (date: Date, cycle: string): Date => {
  const next = new Date(date);
  if (cycle === "monthly") next.setMonth(next.getMonth() + 1);
  else if (cycle === "yearly") next.setFullYear(next.getFullYear() + 1);
  else if (cycle === "weekly") next.setDate(next.getDate() + 7);
  return next;
};

const rollForwardIfPast = async (subscription: {
  id: string;
  nextBillingAt: Date;
  billingCycle: string;
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let nextBillingAt = new Date(subscription.nextBillingAt);
  nextBillingAt.setHours(0, 0, 0, 0);

  let changed = false;

  // Przesuwaj datę w pętli, dopóki nie jest dzisiaj albo w przyszłości
  // (obsługuje przypadek, gdy user nie logował się przez kilka cykli z rzędu)
  while (nextBillingAt < today) {
    nextBillingAt = advanceBillingDate(nextBillingAt, subscription.billingCycle);
    changed = true;
  }

  if (changed) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { nextBillingAt },
    });
    return nextBillingAt;
  }

  return subscription.nextBillingAt;
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { name, price, currency, billingCycle, nextBillingAt, category } = req.body;

    if (!name || !price || !billingCycle || !nextBillingAt) {
      return res.status(400).json({
        error: "Nazwa, cena, cykl rozliczeniowy i data następnej płatności są wymagane",
      });
    }

    const validCycles = ["weekly", "monthly", "yearly"];
    if (!validCycles.includes(billingCycle)) {
      return res.status(400).json({ error: "billingCycle musi być: weekly, monthly lub yearly" });
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        price,
        currency: currency || "PLN",
        billingCycle,
        nextBillingAt: new Date(nextBillingAt),
        category,
        userId: req.userId!,
      },
    });

    return res.status(201).json({ subscription });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Coś poszło nie tak" });
  }
};

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.userId! },
      orderBy: { nextBillingAt: "asc" },
    });

    // Sprawdź każdą subskrypcję i przesuń datę, jeśli minęła
    const updated = await Promise.all(
      subscriptions.map(async (sub) => {
        const nextBillingAt = await rollForwardIfPast(sub);
        return { ...sub, nextBillingAt };
      })
    );

    return res.status(200).json({ subscriptions: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Coś poszło nie tak" });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // sprawdzamy czy subskrypcja istnieje I należy do tego usera
    const existing = await prisma.subscription.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: "Subskrypcja nie znaleziona" });
    }

    if (existing.userId !== req.userId) {
      return res.status(403).json({ error: "Brak dostępu do tej subskrypcji" });
    }

    const { name, price, currency, billingCycle, nextBillingAt, category, isActive } = req.body;

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price }),
        ...(currency && { currency }),
        ...(billingCycle && { billingCycle }),
        ...(nextBillingAt && { nextBillingAt: new Date(nextBillingAt) }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.status(200).json({ subscription: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Coś poszło nie tak" });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.subscription.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ error: "Subskrypcja nie znaleziona" });
    }

    if (existing.userId !== req.userId) {
      return res.status(403).json({ error: "Brak dostępu do tej subskrypcji" });
    }

    await prisma.subscription.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Coś poszło nie tak" });
  }
};