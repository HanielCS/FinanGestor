/*
  Warnings:

  - You are about to alter the column `targetAmount` on the `goals` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `currentAmount` on the `goals` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "goals" ALTER COLUMN "targetAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "currentAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);
