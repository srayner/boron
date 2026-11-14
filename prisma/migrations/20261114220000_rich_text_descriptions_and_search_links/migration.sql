-- Descriptions: room for 20,000 characters of Markdown (cost descriptions are unchanged)
ALTER TABLE `Milestone` MODIFY `description` MEDIUMTEXT NULL;
ALTER TABLE `Project` MODIFY `description` MEDIUMTEXT NULL;
ALTER TABLE `Task` MODIFY `description` MEDIUMTEXT NULL;

-- SearchIndex: link each row to its record instead of a loose entityId
ALTER TABLE `SearchIndex`
    ADD COLUMN `costId` VARCHAR(191) NULL,
    ADD COLUMN `milestoneId` VARCHAR(191) NULL,
    ADD COLUMN `projectId` VARCHAR(191) NULL,
    ADD COLUMN `taskId` VARCHAR(191) NULL,
    MODIFY `content` MEDIUMTEXT NOT NULL;

-- Keep existing rows whose record still exists; drop rows left behind by earlier deletes
UPDATE `SearchIndex` s JOIN `Project` p ON p.`id` = s.`entityId` SET s.`projectId` = s.`entityId` WHERE s.`entityType` = 'project';
UPDATE `SearchIndex` s JOIN `Task` t ON t.`id` = s.`entityId` SET s.`taskId` = s.`entityId` WHERE s.`entityType` = 'task';
UPDATE `SearchIndex` s JOIN `Milestone` m ON m.`id` = s.`entityId` SET s.`milestoneId` = s.`entityId` WHERE s.`entityType` = 'milestone';
UPDATE `SearchIndex` s JOIN `Cost` c ON c.`id` = s.`entityId` SET s.`costId` = s.`entityId` WHERE s.`entityType` = 'cost';
DELETE FROM `SearchIndex` WHERE `projectId` IS NULL AND `taskId` IS NULL AND `milestoneId` IS NULL AND `costId` IS NULL;

DROP INDEX `SearchIndex_entityId_key` ON `SearchIndex`;
ALTER TABLE `SearchIndex` DROP COLUMN `entityId`;

CREATE UNIQUE INDEX `SearchIndex_projectId_key` ON `SearchIndex`(`projectId`);
CREATE UNIQUE INDEX `SearchIndex_taskId_key` ON `SearchIndex`(`taskId`);
CREATE UNIQUE INDEX `SearchIndex_milestoneId_key` ON `SearchIndex`(`milestoneId`);
CREATE UNIQUE INDEX `SearchIndex_costId_key` ON `SearchIndex`(`costId`);

ALTER TABLE `SearchIndex` ADD CONSTRAINT `SearchIndex_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SearchIndex` ADD CONSTRAINT `SearchIndex_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SearchIndex` ADD CONSTRAINT `SearchIndex_milestoneId_fkey` FOREIGN KEY (`milestoneId`) REFERENCES `Milestone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SearchIndex` ADD CONSTRAINT `SearchIndex_costId_fkey` FOREIGN KEY (`costId`) REFERENCES `Cost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
