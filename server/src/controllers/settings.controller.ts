import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getSettings = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: {
      emailRemindersEnabled: true,
      reminderDaysBefore: true,
      remindOnlyActive: true,
      weeklyDigestEnabled: true,
    },
  });

  return res.status(200).json({ settings: user });
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { emailRemindersEnabled, reminderDaysBefore, remindOnlyActive, weeklyDigestEnabled } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        ...(emailRemindersEnabled !== undefined && { emailRemindersEnabled }),
        ...(reminderDaysBefore !== undefined && { reminderDaysBefore }),
        ...(remindOnlyActive !== undefined && { remindOnlyActive }),
        ...(weeklyDigestEnabled !== undefined && { weeklyDigestEnabled }),
      },
      select: {
        emailRemindersEnabled: true,
        reminderDaysBefore: true,
        remindOnlyActive: true,
        weeklyDigestEnabled: true,
      },
    });

    return res.status(200).json({ settings: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Coś poszło nie tak" });
  }
};