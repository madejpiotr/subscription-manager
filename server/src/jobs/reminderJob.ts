import { prisma } from "../lib/prisma.js";
import { sendReminderEmail, sendWeeklyDigestEmail } from "../lib/mailer.js";

const getMonthlyPrice = (price: number, billingCycle: string) => {
  if (billingCycle === "yearly") return price / 12;
  if (billingCycle === "weekly") return price * 4.33;
  return price;
};

export const runDailyReminders = async () => {
  console.log("[reminders] Sprawdzanie zbliżających się płatności...");

  const users = await prisma.user.findMany({
    where: { emailRemindersEnabled: true },
    include: { subscriptions: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const user of users) {
    const relevantSubs = user.remindOnlyActive
      ? user.subscriptions.filter((s) => s.isActive)
      : user.subscriptions;

    for (const sub of relevantSubs) {
      const billingDate = new Date(sub.nextBillingAt);
      billingDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Sprawdź czy to dokładnie ten dzień, w którym trzeba wysłać przypomnienie
      if (diffDays !== user.reminderDaysBefore) continue;

      // Nie wysyłaj drugi raz, jeśli już wysłano dla tej samej daty płatności
      if (
        sub.lastReminderSentAt &&
        new Date(sub.lastReminderSentAt).toDateString() === today.toDateString()
      ) {
        continue;
      }

      await sendReminderEmail(user.email, sub.name, sub.price.toString(), sub.currency, sub.nextBillingAt);

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { lastReminderSentAt: new Date() },
      });

      console.log(`[reminders] Wysłano przypomnienie: ${user.email} - ${sub.name}`);
    }
  }
};

export const runWeeklyDigest = async () => {
  console.log("[digest] Wysyłanie cotygodniowych podsumowań...");

  const users = await prisma.user.findMany({
    where: { weeklyDigestEnabled: true },
    include: { subscriptions: true },
  });

  for (const user of users) {
    const activeSubs = user.subscriptions.filter((s) => s.isActive);
    if (activeSubs.length === 0) continue;

    const monthlyTotal = activeSubs.reduce(
      (sum, s) => sum + getMonthlyPrice(parseFloat(s.price.toString()), s.billingCycle),
      0
    );

    await sendWeeklyDigestEmail(
      user.email,
      activeSubs.map((s) => ({
        name: s.name,
        price: s.price.toString(),
        currency: s.currency,
        nextBillingAt: s.nextBillingAt,
      })),
      monthlyTotal
    );

    console.log(`[digest] Wysłano podsumowanie: ${user.email}`);
  }
};