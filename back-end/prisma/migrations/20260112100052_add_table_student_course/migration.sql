/*
  Warnings:

  - Added the required column `enrollmentId` to the `StudentCourse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `studentcourse` ADD COLUMN `enrollmentId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `StudentCourse` ADD CONSTRAINT `StudentCourse_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `Enrollment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
