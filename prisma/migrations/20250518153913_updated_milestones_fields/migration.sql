/*
  Warnings:

  - You are about to drop the column `targetDate` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Milestone` DROP COLUMN `targetDate`,
    ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `order` INTEGER NULL;
