/*
  Warnings:

  - You are about to drop the column `title` on the `Task` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Task` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(4))`.
  - Added the required column `name` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Task` DROP COLUMN `title`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PLANNED', 'IN_PROGRESS', 'ON_HOLD', 'BLOCKED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED';
