CREATE TABLE "qboConnections" (
	"accessToken" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"lastSyncedAt" timestamp,
	"organizationId" text NOT NULL,
	"realmId" text NOT NULL,
	"refreshToken" text NOT NULL,
	"tokenExpiresAt" timestamp NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qboCustomers" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"displayName" text NOT NULL,
	"email" text,
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"qboId" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qboInvoices" (
	"balance" double precision NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"currency" text,
	"customerName" text,
	"docNumber" text,
	"dueDate" timestamp,
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"qboCustomerId" text,
	"qboId" text NOT NULL,
	"totalAmount" double precision NOT NULL,
	"txnDate" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "qboConnections" ADD CONSTRAINT "qboConnections_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qboCustomers" ADD CONSTRAINT "qboCustomers_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qboInvoices" ADD CONSTRAINT "qboInvoices_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "qbo_connections_organization_id_idx" ON "qboConnections" USING btree ("organizationId");--> statement-breakpoint
CREATE UNIQUE INDEX "qbo_customers_organization_qbo_id_idx" ON "qboCustomers" USING btree ("organizationId","qboId");--> statement-breakpoint
CREATE INDEX "qbo_customers_organization_id_idx" ON "qboCustomers" USING btree ("organizationId");--> statement-breakpoint
CREATE UNIQUE INDEX "qbo_invoices_organization_qbo_id_idx" ON "qboInvoices" USING btree ("organizationId","qboId");--> statement-breakpoint
CREATE INDEX "qbo_invoices_organization_id_idx" ON "qboInvoices" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "qbo_invoices_organization_due_date_idx" ON "qboInvoices" USING btree ("organizationId","dueDate");