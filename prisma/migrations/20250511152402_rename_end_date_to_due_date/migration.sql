/*
  Warnings:

  - You are about to drop the column `deadline` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Project` DROP COLUMN `deadline`,
    DROP COLUMN `endDate`,
    ADD COLUMN `dueDate` DATETIME(3) NULL;
