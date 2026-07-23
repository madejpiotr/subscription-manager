-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "lastReminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "remindOnlyActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminderDaysBefore" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "weeklyDigestEnabled" BOOLEAN NOT NULL DEFAULT false;
