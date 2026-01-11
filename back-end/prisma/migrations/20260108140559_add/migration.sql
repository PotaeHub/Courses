/*
  Warnings:

  - You are about to alter the column `status` on the `enrollment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to drop the column `paymentDate` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `enrollment` MODIFY `status` ENUM('ENROLLED', 'COMPLETED', 'DROPPED') NOT NULL DEFAULT 'ENROLLED';

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `paymentDate`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
