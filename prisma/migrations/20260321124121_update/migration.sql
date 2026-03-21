/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `staff` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `staff_user_id_key` ON `staff`(`user_id`);

-- AddForeignKey
ALTER TABLE `staff` ADD CONSTRAINT `fk_staff_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
