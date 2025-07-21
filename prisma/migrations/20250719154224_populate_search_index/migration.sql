-- CreateTable
CREATE TABLE `SearchIndex` (
    `id` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `entityType` ENUM('project', 'task', 'milestone', 'cost') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SearchIndex_entityId_key`(`entityId`),
    INDEX `SearchIndex_entityType_idx`(`entityType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
