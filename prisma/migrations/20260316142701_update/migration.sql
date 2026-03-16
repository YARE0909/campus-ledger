-- DropForeignKey
ALTER TABLE `enrollments` DROP FOREIGN KEY `fk_enrollments_product_id`;

-- AlterTable
ALTER TABLE `enrollments` MODIFY `product_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `fk_enrollments_product_id` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
