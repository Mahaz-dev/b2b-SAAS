CREATE TABLE "customers" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"displayName" text NOT NULL,
	"email" text,
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"source" text NOT NULL,
	"sourceId" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"balance" double precision NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"currency" text,
	"customerName" text,
	"docNumber" text,
	"dueDate" timestamp,
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"source" text NOT NULL,
	"sourceCustomerId" text,
	"sourceId" text NOT NULL,
	"totalAmount" double precision NOT NULL,
	"txnDate" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xeroConnections" (
	"accessToken" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"lastSyncedAt" timestamp,
	"organizationId" text NOT NULL,
	"refreshToken" text NOT NULL,
	"tenantId" text NOT NULL,
	"tenantName" text,
	"tokenExpiresAt" timestamp NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "qboCustomers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "qboInvoices" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "qboCustomers" CASCADE;--> statement-breakpoint
DROP TABLE "qboInvoices" CASCADE;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xeroConnections" ADD CONSTRAINT "xeroConnections_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "customers_organization_source_id_idx" ON "customers" USING btree ("organizationId","source","sourceId");--> statement-breakpoint
CREATE INDEX "customers_organization_id_idx" ON "customers" USING btree ("organizationId");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_organization_source_id_idx" ON "invoices" USING btree ("organizationId","source","sourceId");--> statement-breakpoint
CREATE INDEX "invoices_organization_id_idx" ON "invoices" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "invoices_organization_due_date_idx" ON "invoices" USING btree ("organizationId","dueDate");--> statement-breakpoint
CREATE UNIQUE INDEX "xero_connections_organization_id_idx" ON "xeroConnections" USING btree ("organizationId");--> statement-breakpoint
ALTER TABLE "chaseEvents" ADD CONSTRAINT "chaseEvents_invoiceId_invoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_invoiceId_invoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promises" ADD CONSTRAINT "promises_invoiceId_invoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentReminders" ADD CONSTRAINT "sentReminders_invoiceId_invoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;