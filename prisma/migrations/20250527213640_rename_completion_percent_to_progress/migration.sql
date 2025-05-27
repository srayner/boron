/*
  Warnings:

  - You are about to drop the column `completionPercent` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Milestone` ADD COLUMN `progress` DECIMAL(10, 2) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE `Project` DROP COLUMN `completionPercent`,
    ADD COLUMN `progress` DECIMAL(10, 2) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE `Task` ADD COLUMN `progress` DECIMAL(10, 2) NOT NULL DEFAULT 0.0;
