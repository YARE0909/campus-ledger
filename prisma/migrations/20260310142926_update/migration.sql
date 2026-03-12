/*
  Warnings:

  - Made the column `tenantsubscriptiontier_id` on table `tenantsubscriptions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `tenantsubscriptions` DROP FOREIGN KEY `fk_tenantsubscriptions_tenantsubscriptiontier_id`;

-- AlterTable
ALTER TABLE `tenantsubscriptions` MODIFY `tenantsubscriptiontier_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `tenantsubscriptions` ADD CONSTRAINT `fk_tenantsubscriptions_tenantsubscriptiontier_id` FOREIGN KEY (`tenantsubscriptiontier_id`) REFERENCES `tenantsubscriptiontiers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
