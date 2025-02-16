import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  facebookId: text("facebook_id"),
  facebookAccessToken: text("facebook_access_token"),
  facebookPages: jsonb("facebook_pages"),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  leadId: text("lead_id").notNull(),
  formId: text("form_id").notNull(),
  pageId: text("page_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("new"),
  data: jsonb("data"),
  processed: boolean("processed").default(false),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  type: text("type").notNull(),
  sent: boolean("sent").default(false),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLeadSchema = createInsertSchema(leads);
export const insertNotificationSchema = createInsertSchema(notifications);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Notification = typeof notifications.$inferSelect;