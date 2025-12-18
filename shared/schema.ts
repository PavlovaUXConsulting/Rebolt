import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url"),
});

// Recipients table
export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  service: text("service").default(""),
  // Bank details for ACH transfers
  bankName: text("bank_name"),
  routingNumber: text("routing_number"),
  accountNumber: text("account_number"),
  accountType: text("account_type"), // 'personal', 'business'
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  recipientName: text("recipient_name").notNull(),
  amount: doublePrecision("amount").notNull(),
  fee: doublePrecision("fee").notNull(),
  total: doublePrecision("total").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  reference: text("reference"),
  confirmationId: text("confirmation_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatarUrl: true,
});

export const insertRecipientSchema = createInsertSchema(recipients).pick({
  userId: true,
  name: true,
  username: true,
  avatarUrl: true,
  service: true,
  bankName: true,
  routingNumber: true,
  accountNumber: true,
  accountType: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  recipientId: true,
  recipientName: true,
  amount: true,
  fee: true,
  total: true,
  method: true,
  status: true,
  reference: true,
  confirmationId: true,
}).extend({
  method: z.enum(["paypal", "venmo", "rebolt", "ach"]),
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  amount: z.number().positive(),
  fee: z.number().default(0.20),
  confirmationId: z.string().optional(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recipients: many(recipients),
  transactions: many(transactions),
}));

export const recipientsRelations = relations(recipients, ({ one }) => ({
  user: one(users, {
    fields: [recipients.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  recipient: one(recipients, {
    fields: [transactions.recipientId],
    references: [recipients.id],
  }),
}));

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRecipient = z.infer<typeof insertRecipientSchema>;
export type Recipient = typeof recipients.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Transaction with recipient bank details for history display
export type TransactionWithRecipient = Transaction & {
  bankName?: string | null;
  routingNumber?: string | null;
  accountNumber?: string | null;
  accountType?: string | null;
  confirmationId?: string | null;
};
