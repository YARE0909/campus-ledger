/*
  Warnings:

  - You are about to alter the column `status` on the `enrollments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `enrollments` MODIFY `status` ENUM('Applied', 'Approved', 'Active', 'Completed', 'Rejected', 'Cancelled', 'Dropped', 'Waitlisted') NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `status` ENUM('Draft', 'Published', 'Archived', 'Cancelled') NULL;

-- CreateTable
CREATE TABLE `courseevaluation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `enrollment_id` INTEGER NOT NULL,
    `CourseTopicID` INTEGER NOT NULL,
    `evaluation_type` ENUM('Monthly', 'Quarterly', 'Annual', 'Interim', 'Final') NOT NULL,
    `Status` ENUM('To Do', 'In Progress', 'Submitted', 'Under Review', 'Completed', 'Cancelled') NOT NULL,
    `grade` VARCHAR(50) NULL,
    `rank` VARCHAR(50) NULL,
    `comments` VARCHAR(50) NULL,
    `evaluation_on` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
