import { users, customers, bills, type User, type Customer, type Bill, type InsertUser, type InsertCustomer, type InsertBill } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Customer operations
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomersByUserId(userId: number): Promise<Customer[]>;
  createCustomer(userId: number, customer: InsertCustomer): Promise<Customer>;

  // Bill operations
  getBill(id: number): Promise<Bill | undefined>;
  getBillsByUserId(userId: number): Promise<Bill[]>;
  createBill(userId: number, bill: InsertBill): Promise<Bill>;
  updateBillStatus(id: number, status: string): Promise<Bill>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomersByUserId(userId: number): Promise<Customer[]> {
    return db.select().from(customers).where(eq(customers.userId, userId));
  }

  async createCustomer(userId: number, insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values({ ...insertCustomer, userId })
      .returning();
    return customer;
  }

  async getBill(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async getBillsByUserId(userId: number): Promise<Bill[]> {
    return db.select().from(bills).where(eq(bills.userId, userId));
  }

  async createBill(userId: number, insertBill: InsertBill): Promise<Bill> {
    const [bill] = await db
      .insert(bills)
      .values({ ...insertBill, userId })
      .returning();
    return bill;
  }

  async updateBillStatus(id: number, status: string): Promise<Bill> {
    const [bill] = await db
      .update(bills)
      .set({ status })
      .where(eq(bills.id, id))
      .returning();
    return bill;
  }
}

export const storage = new DatabaseStorage();