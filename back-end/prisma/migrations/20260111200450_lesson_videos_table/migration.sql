/*
  Warnings:

  - You are about to drop the column `videoUrl` on the `lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `lesson` DROP COLUMN `videoUrl`;

-- CreateTable
CREATE TABLE `LessonVideo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `lessonId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `LessonVideo` ADD CONSTRAINT `LessonVideo_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
