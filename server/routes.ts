import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertUserSchema, insertCustomerSchema, insertBillSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import { logger } from './logger';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session({
    store: new SessionStore({ checkPeriod: 86400000 }),
    secret: "billing-app-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, businessName: user.businessName });
    } catch (error) {
      logger.error("Registration failed", error);
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(credentials.username);

      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;
      res.json({ id: user.id, username: user.username, businessName: user.businessName });
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({ id: user.id, username: user.username, businessName: user.businessName });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const customers = await storage.getCustomersByUserId(req.session.userId);
    res.json(customers);
  });

  app.post("/api/customers", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      logger.info("Creating customer", { userId: req.session.userId, customerData });
      const customer = await storage.createCustomer(req.session.userId, customerData);
      logger.info("Customer created successfully", { customer });
      res.json(customer);
    } catch (error) {
      logger.error("Failed to create customer", error);
      res.status(400).json({ message: "Invalid data" });
    }
  });

  // Bill routes
  app.get("/api/bills", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const bills = await storage.getBillsByUserId(req.session.userId);
    res.json(bills);
  });

  app.post("/api/bills", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const billData = insertBillSchema.parse(req.body);
      const bill = await storage.createBill(req.session.userId, billData);
      res.json(bill);
    } catch (error) {
      logger.error("Failed to create bill", error);
      res.status(400).json({ message: "Invalid data" });
    }
  });

  app.patch("/api/bills/:id/status", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    try {
      const { status } = req.body;
      const bill = await storage.updateBillStatus(parseInt(req.params.id), status);
      res.json(bill);
    } catch (error) {
      res.status(400).json({ message: "Invalid data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}