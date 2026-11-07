ALTER TABLE `users` ADD `preferredLanguage` varchar(16) DEFAULT 'auto' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` varchar(16) NOT NULL DEFAULT 'auto';--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`);
