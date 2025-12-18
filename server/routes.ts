import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertRecipientSchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users route
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Failed to get user:", error);
      res.status(500).json({ message: "Failed to retrieve user" });
    }
  });

  // Transaction API routes
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await storage.getTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Failed to get transactions:", error);
      res.status(500).json({ message: "Failed to retrieve transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(parseInt(req.params.id));
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Failed to get transaction:", error);
      res.status(500).json({ message: "Failed to retrieve transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const result = insertTransactionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid transaction data",
          errors: result.error.errors 
        });
      }
      
      const transaction = await storage.createTransaction(result.data);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });
  
  app.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const statusSchema = z.object({
        status: z.enum(["pending", "completed", "failed"])
      });
      
      const result = statusSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid status",
          errors: result.error.errors 
        });
      }
      
      const updatedTransaction = await storage.updateTransactionStatus(id, result.data.status);
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Failed to update transaction status:", error);
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  // Recipients API routes
  app.get("/api/users/:userId/recipients", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recipients = await storage.getRecipientsByUser(userId);
      res.json(recipients);
    } catch (error) {
      console.error("Failed to get recipients:", error);
      res.status(500).json({ message: "Failed to retrieve recipients" });
    }
  });
  
  app.post("/api/users/:userId/recipients", async (req, res) => {
    try {
      console.log("Received recipient creation request:", req.body);
      const userId = parseInt(req.params.userId);
      const data = { ...req.body, userId };
      const result = insertRecipientSchema.safeParse(data);
      
      if (!result.success) {
        console.log("Validation failed:", result.error.errors);
        return res.status(400).json({ 
          message: "Invalid recipient data",
          errors: result.error.errors 
        });
      }
      
      const recipient = await storage.createRecipient(result.data);
      console.log("Created recipient:", recipient);
      res.status(201).json(recipient);
    } catch (error) {
      console.error("Failed to create recipient:", error);
      res.status(500).json({ message: "Failed to create recipient" });
    }
  });

  app.get("/api/recipients/:id", async (req, res) => {
    try {
      const recipient = await storage.getRecipient(parseInt(req.params.id));
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      res.json(recipient);
    } catch (error) {
      console.error("Failed to get recipient:", error);
      res.status(500).json({ message: "Failed to retrieve recipient" });
    }
  });
  
  app.post("/api/recipients", async (req, res) => {
    try {
      const result = insertRecipientSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid recipient data",
          errors: result.error.errors 
        });
      }
      
      const recipient = await storage.createRecipient(result.data);
      res.status(201).json(recipient);
    } catch (error) {
      console.error("Failed to create recipient:", error);
      res.status(500).json({ message: "Failed to create recipient" });
    }
  });

  app.put("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertRecipientSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid recipient data",
          errors: result.error.errors 
        });
      }
      
      const updatedRecipient = await storage.updateRecipient(id, result.data);
      
      if (!updatedRecipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      res.json(updatedRecipient);
    } catch (error) {
      console.error("Failed to update recipient:", error);
      res.status(500).json({ message: "Failed to update recipient" });
    }
  });

  app.delete("/api/recipients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deletedRecipient = await storage.deleteRecipient(id);
      
      if (!deletedRecipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      res.json(deletedRecipient);
    } catch (error) {
      console.error("Failed to delete recipient:", error);
      res.status(500).json({ message: "Failed to delete recipient" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
