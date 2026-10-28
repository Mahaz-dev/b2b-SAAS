CREATE TABLE "subscriptions" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"currentPeriodEnd" timestamp,
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"paddleCustomerId" text NOT NULL,
	"paddleSubscriptionId" text NOT NULL,
	"status" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_organization_id_idx" ON "subscriptions" USING btree ("organizationId");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_paddle_subscription_id_idx" ON "subscriptions" USING btree ("paddleSubscriptionId");--> statement-breakpoint
CREATE INDEX "subscriptions_paddle_customer_id_idx" ON "subscriptions" USING btree ("paddleCustomerId");