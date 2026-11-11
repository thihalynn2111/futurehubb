/*
  Warnings:

  - You are about to alter the column `sortOrder` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Int`.
  - Made the column `subtitle` on table `projects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `projects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `projects` MODIFY `subtitle` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NOT NULL,
    MODIFY `status` INTEGER NOT NULL DEFAULT 0,
    MODIFY `sortOrder` INTEGER NOT NULL DEFAULT 0;
