-- Add this as a new migration file: prisma/migrations/[timestamp]_add_product_tables/migration.sql

-- CreateTable for Products
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `short_description` TEXT NULL,
    `product_detail` TEXT NULL,
    `source` VARCHAR(191) NOT NULL,
    `brand_name` VARCHAR(191) NULL,
    `manufacturer_info` VARCHAR(191) NULL,
    `source_url` VARCHAR(500) NULL,
    `weight` DECIMAL(8,2) NULL,
    `size_chart` TEXT NULL,
    `manage_inventory` BOOLEAN NOT NULL DEFAULT false,
    `meta_title` VARCHAR(191) NULL,
    `meta_description` TEXT NULL,
    `slug` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `batch_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `products_sku_key`(`sku`),
    UNIQUE INDEX `products_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for ProductVariants
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `stock_status` BOOLEAN NOT NULL DEFAULT true,
    `regular_price` DECIMAL(10,2) NOT NULL,
    `cost_price` DECIMAL(10,2) NULL,
    `on_sale` BOOLEAN NOT NULL DEFAULT false,
    `sale_price` DECIMAL(10,2) NULL,
    `discount_cost_price` DECIMAL(10,2) NULL,
    `variant_data` JSON NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `product_variants_sku_key`(`sku`),
    INDEX `product_variants_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for Categories
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `parent_id` INTEGER NULL,
    `level` INTEGER NOT NULL DEFAULT 0,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for ProductCategories (Junction Table)
CREATE TABLE `product_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    UNIQUE INDEX `product_categories_product_id_category_id_key`(`product_id`, `category_id`),
    INDEX `product_categories_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for ProductImages
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `alt_text` VARCHAR(191) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `product_images_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for ProductAttributes
CREATE TABLE `product_attributes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `attribute_name` VARCHAR(191) NOT NULL,
    `attribute_value` VARCHAR(191) NOT NULL,

    INDEX `product_attributes_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for ProductTags
CREATE TABLE `product_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `tag_name` VARCHAR(191) NOT NULL,

    INDEX `product_tags_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable for UploadBatches
CREATE TABLE `upload_batches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `uploaded_by` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `total_rows` INTEGER NOT NULL,
    `processed_rows` INTEGER NOT NULL DEFAULT 0,
    `success_rows` INTEGER NOT NULL DEFAULT 0,
    `error_rows` INTEGER NOT NULL DEFAULT 0,
    `error_log` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` 
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` 
    FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_product_id_fkey` 
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_category_id_fkey` 
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_fkey` 
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attributes` ADD CONSTRAINT `product_attributes_product_id_fkey` 
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_product_id_fkey` 
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert some sample categories
INSERT INTO `categories` (`name`, `slug`, `parent_id`, `level`, `sort_order`) VALUES
('Women', 'women', NULL, 0, 1),
('Men', 'men', NULL, 0, 2),
('Kids', 'kids', NULL, 0, 3),
('Sarees', 'sarees', 1, 1, 1),
('Kurtas', 'kurtas', 1, 1, 2),
('Lehengas', 'lehengas', 1, 1, 3),
('Sherwanis', 'sherwanis', 2, 1, 1),
('Kurta Sets', 'kurta-sets', 2, 1, 2),
('Girls Wear', 'girls-wear', 3, 1, 1),
('Boys Wear', 'boys-wear', 3, 1, 2);