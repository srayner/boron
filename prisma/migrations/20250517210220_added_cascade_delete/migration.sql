-- DropForeignKey
ALTER TABLE `Cost` DROP FOREIGN KEY `Cost_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `Cost` DROP FOREIGN KEY `Cost_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `Milestone` DROP FOREIGN KEY `Milestone_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `Task` DROP FOREIGN KEY `Task_projectId_fkey`;

-- DropIndex
DROP INDEX `Cost_projectId_fkey` ON `Cost`;

-- DropIndex
DROP INDEX `Cost_taskId_fkey` ON `Cost`;

-- DropIndex
DROP INDEX `Milestone_projectId_fkey` ON `Milestone`;

-- DropIndex
DROP INDEX `Task_projectId_fkey` ON `Task`;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cost` ADD CONSTRAINT `Cost_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cost` ADD CONSTRAINT `Cost_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Milestone` ADD CONSTRAINT `Milestone_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
