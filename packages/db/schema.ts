import { pgTable, text, uuid, timestamp, numeric, json, pgEnum, date, boolean } from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["Free", "Plus", "Pro"]);
export const platformEnum = pgEnum("platform", ["paypal"]);
export const vaultTypeEnum = pgEnum("vault_type", ["audio", "video", "text"]);
export const vaultTriggerEnum = pgEnum("vault_trigger", ["fixed_date", "inactivity"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  dob: date("dob"),
  sex: text("sex", { enum: ["male", "female"] }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const deathPrediction = pgTable("death_prediction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  predictedDod: date("predicted_dod"),
  baseRemainingYears: numeric("base_remaining_years", { precision: 5, scale: 2 }),
  adjustedYears: numeric("adjusted_years", { precision: 5, scale: 2 }),
  factors: json("factors"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const legacyVault = pgTable("legacy_vault", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  type: vaultTypeEnum("type").notNull(),
  storagePath: text("storage_path").notNull(),
  trigger: vaultTriggerEnum("trigger").notNull(),
  triggerValue: date("trigger_value"),
  delivered: boolean("delivered").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  paypalId: text("paypal_id").unique(),
  tier: tierEnum("tier").notNull(),
  renewAt: date("renew_at"),
  platform: platformEnum("platform").default("paypal"),
  isActive: boolean("is_active").default(true),
}); 