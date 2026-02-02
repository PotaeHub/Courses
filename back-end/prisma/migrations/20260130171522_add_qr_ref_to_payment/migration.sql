-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_courseId_fkey`;

-- DropIndex
DROP INDEX `Payment_courseId_fkey` ON `payment`;

-- AlterTable
ALTER TABLE `payment` ADD COLUMN `providerRef` VARCHAR(191) NULL,
    ADD COLUMN `qrRef` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
