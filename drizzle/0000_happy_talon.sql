CREATE TYPE "public"."membership_role" AS ENUM('OWNER', 'MEMBER');--> statement-breakpoint
CREATE TABLE "accounts" (
	"access_token" text,
	"expires_at" integer,
	"id_token" text,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"scope" text,
	"session_state" text,
	"token_type" text,
	"type" text NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"role" "membership_role" DEFAULT 'MEMBER' NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"expires" timestamp NOT NULL,
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"email" text,
	"emailVerified" timestamp,
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"name" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationTokens" (
	"expires" timestamp NOT NULL,
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	CONSTRAINT "verificationTokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "waitlistEntries" (
	"company" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_user_organization_idx" ON "memberships" USING btree ("userId","organizationId");--> statement-breakpoint
CREATE INDEX "memberships_organization_id_idx" ON "memberships" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "memberships_user_id_idx" ON "memberships" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_email_idx" ON "waitlistEntries" USING btree ("email");--> statement-breakpoint
CREATE INDEX "waitlist_entries_created_at_idx" ON "waitlistEntries" USING btree ("createdAt");