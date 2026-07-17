/*
  Warnings:

  - Made the column `billingDay` on table `Subscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "billingDay" SET NOT NULL;
