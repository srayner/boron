-- AlterTable
ALTER TABLE `Project` MODIFY `budget` DECIMAL(10, 2) NULL,
    MODIFY `actualCost` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
