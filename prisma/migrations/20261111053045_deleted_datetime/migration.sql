/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `permissions` table. All the data in the column will be lost.
  - You are about to alter the column `sortOrder` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE `permissions` DROP COLUMN `deletedAt`;

-- AlterTable
ALTER TABLE `projects` MODIFY `subtitle` VARCHAR(191) NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `status` INTEGER NOT NULL DEFAULT 1,
    MODIFY `sortOrder` DECIMAL(10, 2) NOT NULL DEFAULT 0;
