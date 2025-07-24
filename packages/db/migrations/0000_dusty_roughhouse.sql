CREATE TYPE "public"."platform" AS ENUM('paypal');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('Free', 'Plus', 'Pro');--> statement-breakpoint
CREATE TYPE "public"."vault_trigger" AS ENUM('fixed_date', 'inactivity');--> statement-breakpoint
CREATE TYPE "public"."vault_type" AS ENUM('audio', 'video', 'text');--> statement-breakpoint
CREATE TABLE "death_prediction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"predicted_dod" date,
	"base_remaining_years" numeric(5, 2),
	"adjusted_years" numeric(5, 2),
	"factors" json,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "legacy_vault" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"type" "vault_type" NOT NULL,
	"storage_path" text NOT NULL,
	"trigger" "vault_trigger" NOT NULL,
	"trigger_value" date,
	"delivered" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"tier" "tier" NOT NULL,
	"renew_at" date,
	"platform" "platform" DEFAULT 'paypal',
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"dob" date,
	"sex" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "death_prediction" ADD CONSTRAINT "death_prediction_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_vault" ADD CONSTRAINT "legacy_vault_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;