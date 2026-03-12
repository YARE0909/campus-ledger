/*
  Warnings:

  - You are about to drop the column `batch_id` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `marked_by` on the `attendance` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `batches` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `batches` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(1))`.
  - You are about to drop the column `updated_at` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `CourseTopicID` on the `courseevaluation` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `courseevaluation` table. All the data in the column will be lost.
  - You are about to drop the column `evaluation_on` on the `courseevaluation` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `courseprogress` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(2))`.
  - You are about to drop the column `IsActive` on the `coursetopics` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `enrollmentbatches` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `invoices` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(4))`.
  - You are about to drop the column `updated_at` on the `paymentoptions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `productfees` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `staff` table. All the data in the column will be lost.
  - You are about to drop the column `branch_id` on the `staffmappings` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `staffmappings` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptiontierid` on the `tenantsubscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tenantsubscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `enrollmentpaymentdetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `institutionbilling` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `performance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptiontiers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `attendance_date` to the `attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_topic_id` to the `courseevaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `courseevaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enrollment_id` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_date` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `attendance` DROP COLUMN `batch_id`,
    DROP COLUMN `date`,
    DROP COLUMN `marked_by`,
    ADD COLUMN `attendance_date` DATE NOT NULL,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `batches` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `status` ENUM('Draft', 'Open', 'Closed', 'Ongoing', 'Completed', 'Cancelled') NULL;

-- AlterTable
ALTER TABLE `branches` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `courseevaluation` DROP COLUMN `CourseTopicID`,
    DROP COLUMN `Status`,
    DROP COLUMN `evaluation_on`,
    ADD COLUMN `course_topic_id` INTEGER NOT NULL,
    ADD COLUMN `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `evaluation_date` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `marks` INTEGER NULL,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `status` ENUM('To Do', 'In Progress', 'Submitted', 'Under Review', 'Completed', 'Cancelled') NOT NULL,
    MODIFY `evaluation_type` ENUM('Practice', 'Mock', 'Assessment', 'Monthly', 'Quarterly', 'Annual', 'Interim', 'Final') NOT NULL;

-- AlterTable
ALTER TABLE `courseprogress` ADD COLUMN `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `status` ENUM('Not Started', 'In Progress', 'Completed', 'Withdrawn') NOT NULL;

-- AlterTable
ALTER TABLE `coursetopics` DROP COLUMN `IsActive`,
    ADD COLUMN `isactive` TINYINT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `enrollmentbatches` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `enrollments` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `invoices` DROP COLUMN `student_id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `enrollment_id` INTEGER NOT NULL,
    ADD COLUMN `invoice_date` DATETIME(0) NOT NULL,
    ADD COLUMN `invoice_no` VARCHAR(45) NULL,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `status` ENUM('Draft', 'Generated', 'Due', 'Overdue', 'Pending', 'Cancelled') NULL;

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `batch_id` INTEGER NULL,
    ADD COLUMN `student_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `paymentoptions` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `payments` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `productfees` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `products` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `staff` DROP COLUMN `updated_at`,
    ADD COLUMN `email` VARCHAR(100) NULL,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `phone` VARCHAR(25) NULL,
    ADD COLUMN `staff_status` ENUM('Active', 'Inactive', 'On Leave', 'Suspended', 'Terminated', 'Archived', 'Quit') NULL,
    ADD COLUMN `staff_title` ENUM('Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof') NULL,
    MODIFY `name` VARCHAR(300) NOT NULL;

-- AlterTable
ALTER TABLE `staffmappings` DROP COLUMN `branch_id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `students` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `tenants` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `tenantsubscriptions` DROP COLUMN `subscriptiontierid`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `tenantsubscriptiontier_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `updated_at`,
    ADD COLUMN `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- DropTable
DROP TABLE `enrollmentpaymentdetails`;

-- DropTable
DROP TABLE `institutionbilling`;

-- DropTable
DROP TABLE `performance`;

-- DropTable
DROP TABLE `subscriptiontiers`;

-- CreateTable
CREATE TABLE `enrollmentpayments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NULL,
    `paid_on` DATETIME(0) NULL,
    `bank_details` VARCHAR(1000) NULL,
    `transaction_no` VARCHAR(100) NULL,
    `comments` TEXT NULL,
    `payment_status` ENUM('Pending', 'Processing', 'Success', 'Failed', 'Partially Paid', 'Refunded', 'Cancelled') NOT NULL,
    `paymentoption_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_enrollmentpaymentdetails_idx`(`paymentoption_id`),
    INDEX `fk_enrollmentpaymentdetails_invoice_id_idx`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenantbilling` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bill_no` DATETIME(0) NOT NULL,
    `bill_date` DATETIME(0) NOT NULL,
    `branch_id` INTEGER NOT NULL,
    `tenantsubscriptiontier_id` INTEGER NOT NULL,
    `total_active_students` INTEGER NULL,
    `amount_per_student` DECIMAL(10, 2) NULL,
    `bill_total_amount` DECIMAL(10, 2) NULL,
    `bill_status` ENUM('Trial', 'Active', 'Pending Payment', 'Overdue', 'Suspended', 'Cancelled', 'Expired') NULL,
    `created_at` DATETIME(0) NULL,
    `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_tenantbilling_bill_no_idx`(`branch_id`),
    INDEX `fk_tenantbilling_tenantsubscriptiontier_id_idx`(`tenantsubscriptiontier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenantpayments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bill_id` INTEGER NULL,
    `paid_on` DATETIME(0) NULL,
    `bank_details` VARCHAR(1000) NULL,
    `transaction_no` VARCHAR(100) NULL,
    `comments` TEXT NULL,
    `payment_status` ENUM('Pending', 'Processing', 'Success', 'Failed', 'Partially Paid', 'Refunded', 'Cancelled') NULL,
    `paymentoption_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_tenantpayments_bill_id_idx`(`bill_id`),
    INDEX `fk_tenantpayments_paymentoption_id_idx`(`paymentoption_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenantsubscriptiontiers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `student_count_min` INTEGER NOT NULL,
    `student_count_max` INTEGER NOT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `price_per_student` DECIMAL(10, 2) NOT NULL,
    `billing_cycle` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `modified_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `fk_attendance_enrollment_id_idx` ON `attendance`(`enrollment_id`);

-- CreateIndex
CREATE INDEX `fk_batches_branch_id_idx` ON `batches`(`branch_id`);

-- CreateIndex
CREATE INDEX `fk_Courseevluation_course_topic_id_idx` ON `courseevaluation`(`course_topic_id`);

-- CreateIndex
CREATE INDEX `fk_courseevaluation_enrollment_id_idx` ON `courseevaluation`(`enrollment_id`);

-- CreateIndex
CREATE INDEX `fk_courseprogress_enrollment_id_idx` ON `courseprogress`(`enrollment_id`);

-- CreateIndex
CREATE INDEX `fk_courseprogress_idx` ON `courseprogress`(`course_topic_id`);

-- CreateIndex
CREATE INDEX `fk_enrollmentbatches_batch_id_idx` ON `enrollmentbatches`(`batch_id`);

-- CreateIndex
CREATE INDEX `fk_enrollmentbatches_enrollment_id_idx` ON `enrollmentbatches`(`enrollment_id`);

-- CreateIndex
CREATE INDEX `fk_enrollments_product_id_idx` ON `enrollments`(`product_id`);

-- CreateIndex
CREATE INDEX `fk_enrollments_student_id_idx` ON `enrollments`(`student_id`);

-- CreateIndex
CREATE INDEX `fk_invoices_branch_id_idx` ON `invoices`(`branch_id`);

-- CreateIndex
CREATE INDEX `fk_invoices_enrollment_id_idx` ON `invoices`(`enrollment_id`);

-- CreateIndex
CREATE INDEX `fk_invoices_product_id_idx` ON `invoices`(`product_id`);

-- CreateIndex
CREATE INDEX `fk_payments_invoice_id_idx` ON `payments`(`invoice_id`);

-- CreateIndex
CREATE INDEX `fk_productfees_product_id_idx` ON `productfees`(`product_id`);

-- CreateIndex
CREATE INDEX `fk_staffmapping_batch_id_idx` ON `staffmappings`(`batch_id`);

-- CreateIndex
CREATE INDEX `fk_staffmapping_product_id_idx` ON `staffmappings`(`product_id`);

-- CreateIndex
CREATE INDEX `fk_staffmapping_staff_id_idx` ON `staffmappings`(`staff_id`);

-- CreateIndex
CREATE INDEX `fk_students_branch_id_idx` ON `students`(`branch_id`);

-- CreateIndex
CREATE INDEX `fk_ tenantsubscriptions_tenant_id_idx` ON `tenantsubscriptions`(`tenant_id`);

-- CreateIndex
CREATE INDEX `fk_tenantsubscriptions_tenantsubscriptiontier_id_idx` ON `tenantsubscriptions`(`tenantsubscriptiontier_id`);

-- CreateIndex
CREATE INDEX `fk_users_tenant_id_idx` ON `users`(`tenant_id`);

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `fk_attendance_enrollment_id` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batches` ADD CONSTRAINT `fk_batches_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courseprogress` ADD CONSTRAINT `fk_courseprogress_course_topic_id` FOREIGN KEY (`course_topic_id`) REFERENCES `coursetopics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courseprogress` ADD CONSTRAINT `fk_courseprogress_enrollment_id` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollmentbatches` ADD CONSTRAINT `fk_enrollmentbatches_batch_id` FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollmentbatches` ADD CONSTRAINT `fk_enrollmentbatches_enrollment_id` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `fk_enrollments_product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `fk_enrollments_student_id` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `fk_invoices_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `fk_invoices_enrollment_id` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `fk_invoices_product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payments_invoice_id` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productfees` ADD CONSTRAINT `fk_productfees_product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffmappings` ADD CONSTRAINT `fk_staffmapping_batch_id` FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffmappings` ADD CONSTRAINT `fk_staffmapping_product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staffmappings` ADD CONSTRAINT `fk_staffmapping_staff_id` FOREIGN KEY (`staff_id`) REFERENCES `staff`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `fk_students_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenantsubscriptions` ADD CONSTRAINT `fk_ tenantsubscriptions_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenantsubscriptions` ADD CONSTRAINT `fk_tenantsubscriptions_tenantsubscriptiontier_id` FOREIGN KEY (`tenantsubscriptiontier_id`) REFERENCES `tenantsubscriptiontiers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courseevaluation` ADD CONSTRAINT `fk_Courseevluation_course_topic_id` FOREIGN KEY (`course_topic_id`) REFERENCES `coursetopics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courseevaluation` ADD CONSTRAINT `fk_courseevaluation_enrollment_id` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollmentpayments` ADD CONSTRAINT `fk_enrollmentpaymentdetails_invoice_id` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollmentpayments` ADD CONSTRAINT `fk_enrollmentpaymentdetails_paymentoption_id` FOREIGN KEY (`paymentoption_id`) REFERENCES `paymentoptions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenantbilling` ADD CONSTRAINT `fk_tenantbilling_bill_no` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenantbilling` ADD CONSTRAINT `fk_tenantbilling_tenantsubscriptiontier_id` FOREIGN KEY (`tenantsubscriptiontier_id`) REFERENCES `tenantsubscriptiontiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenantpayments` ADD CONSTRAINT `fk_tenantpayments_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `tenantbilling`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenantpayments` ADD CONSTRAINT `fk_tenantpayments_paymentoption_id` FOREIGN KEY (`paymentoption_id`) REFERENCES `paymentoptions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
