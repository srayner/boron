/*
  Warnings:

  - You are about to drop the `_TaskMilestones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_TaskMilestones` DROP FOREIGN KEY `_TaskMilestones_A_fkey`;

-- DropForeignKey
ALTER TABLE `_TaskMilestones` DROP FOREIGN KEY `_TaskMilestones_B_fkey`;

-- AlterTable
ALTER TABLE `Cost` MODIFY `note` VARCHAR(250) NULL;

-- AlterTable
ALTER TABLE `Milestone` MODIFY `description` VARCHAR(2000) NULL;

-- AlterTable
ALTER TABLE `Project` MODIFY `description` VARCHAR(2000) NULL;

-- AlterTable
ALTER TABLE `Task` ADD COLUMN `milestoneId` VARCHAR(191) NULL,
    MODIFY `description` VARCHAR(2000) NULL;

-- DropTable
DROP TABLE `_TaskMilestones`;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_milestoneId_fkey` FOREIGN KEY (`milestoneId`) REFERENCES `Milestone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
