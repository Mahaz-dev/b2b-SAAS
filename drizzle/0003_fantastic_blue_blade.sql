CREATE TABLE "chaseEvents" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" text,
	"id" text PRIMARY KEY NOT NULL,
	"invoiceId" text NOT NULL,
	"note" text,
	"organizationId" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disputes" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"invoiceId" text NOT NULL,
	"openedBy" text,
	"organizationId" text NOT NULL,
	"reason" text NOT NULL,
	"resolvedAt" timestamp,
	"status" text DEFAULT 'open' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promises" (
	"amount" double precision NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" text,
	"id" text PRIMARY KEY NOT NULL,
	"invoiceId" text NOT NULL,
	"note" text,
	"organizationId" text NOT NULL,
	"promisedDate" timestamp NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sentReminders" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"invoiceId" text NOT NULL,
	"organizationId" text NOT NULL,
	"sentAt" timestamp DEFAULT now() NOT NULL,
	"sentBy" text,
	"step" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chaseEvents" ADD CONSTRAINT "chaseEvents_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chaseEvents" ADD CONSTRAINT "chaseEvents_invoiceId_qboInvoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."qboInvoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chaseEvents" ADD CONSTRAINT "chaseEvents_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_invoiceId_qboInvoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."qboInvoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_openedBy_users_id_fk" FOREIGN KEY ("openedBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promises" ADD CONSTRAINT "promises_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promises" ADD CONSTRAINT "promises_invoiceId_qboInvoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."qboInvoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promises" ADD CONSTRAINT "promises_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentReminders" ADD CONSTRAINT "sentReminders_invoiceId_qboInvoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."qboInvoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentReminders" ADD CONSTRAINT "sentReminders_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sentReminders" ADD CONSTRAINT "sentReminders_sentBy_users_id_fk" FOREIGN KEY ("sentBy") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chase_events_organization_id_idx" ON "chaseEvents" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "chase_events_invoice_id_idx" ON "chaseEvents" USING btree ("invoiceId");--> statement-breakpoint
CREATE INDEX "disputes_organization_id_idx" ON "disputes" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "disputes_invoice_id_idx" ON "disputes" USING btree ("invoiceId");--> statement-breakpoint
CREATE INDEX "promises_organization_id_idx" ON "promises" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "promises_invoice_id_idx" ON "promises" USING btree ("invoiceId");--> statement-breakpoint
CREATE INDEX "sent_reminders_organization_id_idx" ON "sentReminders" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "sent_reminders_invoice_id_idx" ON "sentReminders" USING btree ("invoiceId");