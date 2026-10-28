import {
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  image: text("image"),
  name: text("name"),
});

export const accounts = pgTable(
  "accounts",
  {
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    id_token: text("id_token"),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    scope: text("scope"),
    session_state: text("session_state"),
    token_type: text("token_type"),
    type: text("type").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_id_idx").on(table.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    expires: timestamp("expires", { mode: "date" }).notNull(),
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    expires: timestamp("expires", { mode: "date" }).notNull(),
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

export const membershipRole = pgEnum("membership_role", ["OWNER", "MEMBER"]);

export const organizations = pgTable(
  "organizations",
  {
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("organizations_slug_idx").on(table.slug)],
);

export const memberships = pgTable(
  "memberships",
  {
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: membershipRole("role").default("MEMBER").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("memberships_user_organization_idx").on(table.userId, table.organizationId),
    index("memberships_organization_id_idx").on(table.organizationId),
    index("memberships_user_id_idx").on(table.userId),
  ],
);

export const waitlistEntries = pgTable(
  "waitlistEntries",
  {
    company: text("company"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    email: text("email").notNull(),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
  },
  (table) => [
    uniqueIndex("waitlist_entries_email_idx").on(table.email),
    index("waitlist_entries_created_at_idx").on(table.createdAt),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    paddleCustomerId: text("paddleCustomerId").notNull(),
    paddleSubscriptionId: text("paddleSubscriptionId").notNull(),
    status: text("status").notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("subscriptions_organization_id_idx").on(table.organizationId),
    uniqueIndex("subscriptions_paddle_subscription_id_idx").on(table.paddleSubscriptionId),
    index("subscriptions_paddle_customer_id_idx").on(table.paddleCustomerId),
  ],
);

export const qboConnections = pgTable(
  "qboConnections",
  {
    accessToken: text("accessToken").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lastSyncedAt: timestamp("lastSyncedAt", { mode: "date" }),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    realmId: text("realmId").notNull(),
    refreshToken: text("refreshToken").notNull(),
    tokenExpiresAt: timestamp("tokenExpiresAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("qbo_connections_organization_id_idx").on(table.organizationId)],
);

export const qboCustomers = pgTable(
  "qboCustomers",
  {
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    displayName: text("displayName").notNull(),
    email: text("email"),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    qboId: text("qboId").notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("qbo_customers_organization_qbo_id_idx").on(table.organizationId, table.qboId),
    index("qbo_customers_organization_id_idx").on(table.organizationId),
  ],
);

export const qboInvoices = pgTable(
  "qboInvoices",
  {
    balance: doublePrecision("balance").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    currency: text("currency"),
    customerName: text("customerName"),
    docNumber: text("docNumber"),
    dueDate: timestamp("dueDate", { mode: "date" }),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organizationId: text("organizationId")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    qboCustomerId: text("qboCustomerId"),
    qboId: text("qboId").notNull(),
    totalAmount: doublePrecision("totalAmount").notNull(),
    txnDate: timestamp("txnDate", { mode: "date" }),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("qbo_invoices_organization_qbo_id_idx").on(table.organizationId, table.qboId),
    index("qbo_invoices_organization_id_idx").on(table.organizationId),
    index("qbo_invoices_organization_due_date_idx").on(table.organizationId, table.dueDate),
  ],
);
