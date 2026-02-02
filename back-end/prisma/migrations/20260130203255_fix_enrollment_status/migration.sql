/*
  Warnings:

  - You are about to alter the column `status` on the `enrollment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(3))`.
  - The values [CANCELLED] on the enum `Order_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `enrollment` MODIFY `status` ENUM('PENDING', 'APPROVED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('PENDING', 'PAID') NOT NULL DEFAULT 'PENDING';
