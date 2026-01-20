/*
  Warnings:

  - Made the column `method` on table `payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `payment` MODIFY `method` ENUM('PROMPTPAY', 'BANK_TRANSFER') NOT NULL;
