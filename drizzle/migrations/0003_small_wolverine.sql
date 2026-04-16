DROP INDEX "server_invites_server_id_idx";--> statement-breakpoint
DROP INDEX "channel_members_user_id_idx";--> statement-breakpoint
DROP INDEX "channels_server_id_idx";--> statement-breakpoint
DROP INDEX "channels_id_server_id_idx";--> statement-breakpoint
CREATE INDEX "server_invites_server_id_created_at_idx" ON "server_invites" USING btree ("server_id","created_at");--> statement-breakpoint
CREATE INDEX "channel_members_user_id_added_at_idx" ON "channel_members" USING btree ("user_id","added_at");--> statement-breakpoint
CREATE INDEX "channel_members_channel_id_added_at_idx" ON "channel_members" USING btree ("channel_id","added_at");--> statement-breakpoint
CREATE INDEX "channels_server_is_private_created_at_idx" ON "channels" USING btree ("server_id","is_private","created_at");