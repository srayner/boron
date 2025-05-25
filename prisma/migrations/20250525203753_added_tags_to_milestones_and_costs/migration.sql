-- CreateTable
CREATE TABLE `_CostTags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CostTags_AB_unique`(`A`, `B`),
    INDEX `_CostTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MilestoneTags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_MilestoneTags_AB_unique`(`A`, `B`),
    INDEX `_MilestoneTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CostTags` ADD CONSTRAINT `_CostTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `Cost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CostTags` ADD CONSTRAINT `_CostTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MilestoneTags` ADD CONSTRAINT `_MilestoneTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `Milestone`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MilestoneTags` ADD CONSTRAINT `_MilestoneTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
