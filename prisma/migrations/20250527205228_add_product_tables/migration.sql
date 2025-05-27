/*
  Warnings:

  - You are about to alter the column `image_url` on the `product_images` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.
  - You are about to alter the column `source_url` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `product_images` MODIFY `image_url` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `products` MODIFY `source_url` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isAffiliate` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `phone` VARCHAR(191) NULL;
