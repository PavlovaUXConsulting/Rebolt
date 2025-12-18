import { users, recipients, transactions, type User, type InsertUser, type Recipient, type InsertRecipient, type Transaction, type InsertTransaction, type TransactionWithRecipient } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Recipient methods
  getRecipient(id: number): Promise<Recipient | undefined>;
  getRecipientsByUser(userId: number): Promise<Recipient[]>;
  createRecipient(recipient: InsertRecipient): Promise<Recipient>;
  updateRecipient(id: number, updates: Partial<InsertRecipient>): Promise<Recipient | undefined>;
  deleteRecipient(id: number): Promise<Recipient | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUser(userId: number): Promise<TransactionWithRecipient[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: "pending" | "completed" | "failed"): Promise<Transaction | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Recipient methods
  async getRecipient(id: number): Promise<Recipient | undefined> {
    const [recipient] = await db.select().from(recipients).where(eq(recipients.id, id));
    return recipient || undefined;
  }
  
  async getRecipientsByUser(userId: number): Promise<Recipient[]> {
    return await db.select().from(recipients).where(eq(recipients.userId, userId));
  }
  
  async createRecipient(recipient: InsertRecipient): Promise<Recipient> {
    const [newRecipient] = await db
      .insert(recipients)
      .values(recipient)
      .returning();
    return newRecipient;
  }

  async updateRecipient(id: number, updates: Partial<InsertRecipient>): Promise<Recipient | undefined> {
    const [updatedRecipient] = await db
      .update(recipients)
      .set(updates)
      .where(eq(recipients.id, id))
      .returning();
    return updatedRecipient || undefined;
  }

  async deleteRecipient(id: number): Promise<Recipient | undefined> {
    const [deletedRecipient] = await db
      .delete(recipients)
      .where(eq(recipients.id, id))
      .returning();
    return deletedRecipient || undefined;
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }
  
  async getTransactionsByUser(userId: number): Promise<TransactionWithRecipient[]> {
    return await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        recipientId: transactions.recipientId,
        recipientName: transactions.recipientName,
        amount: transactions.amount,
        fee: transactions.fee,
        total: transactions.total,
        method: transactions.method,
        status: transactions.status,
        reference: transactions.reference,
        createdAt: transactions.createdAt,
        // Add bank details from recipients table
        bankName: recipients.bankName,
        routingNumber: recipients.routingNumber,
        accountNumber: recipients.accountNumber,
        accountType: recipients.accountType,
      })
      .from(transactions)
      .leftJoin(recipients, eq(transactions.recipientId, recipients.id))
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }
  
  async updateTransactionStatus(id: number, status: "pending" | "completed" | "failed"): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }
}

export const storage = new DatabaseStorage();
