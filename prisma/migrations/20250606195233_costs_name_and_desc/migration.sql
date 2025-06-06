/*
  Warnings:

  - You are about to drop the column `note` on the `Cost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Cost` DROP COLUMN `note`,
    ADD COLUMN `description` VARCHAR(2000) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL;
