CREATE TABLE "memberships" (
	"user_id" uuid NOT NULL,
	"server_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"joined_via_code" varchar(64),
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_user_id_server_id_pk" PRIMARY KEY("user_id","server_id")
);
--> statement-breakpoint
CREATE TABLE "server_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"code" varchar(64) NOT NULL,
	"expires_at" timestamp,
	"max_uses" integer,
	"use_count" integer DEFAULT 0 NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "server_invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"avatar" varchar(255),
	"name" varchar(100) NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_invites" ADD CONSTRAINT "server_invites_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_invites" ADD CONSTRAINT "server_invites_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memberships_server_id_idx" ON "memberships" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "server_invites_server_id_idx" ON "server_invites" USING btree ("server_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_token_token_idx" ON "refresh_tokens" USING btree ("token");