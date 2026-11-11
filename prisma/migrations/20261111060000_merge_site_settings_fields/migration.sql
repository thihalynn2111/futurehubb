-- Preserve settings used by both merged admin implementations.
ALTER TABLE `site_settings`
    ADD COLUMN `logoHeaderLink` VARCHAR(191) NULL,
    ADD COLUMN `logoFooterLink` VARCHAR(191) NULL,
    ADD COLUMN `officeHours` VARCHAR(191) NULL;

ALTER TABLE `product_categories` ADD COLUMN `status` INTEGER NOT NULL DEFAULT 1;
