import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  customerId: integer("customer_id").notNull(),
  billNumber: text("bill_number").notNull(),
  date: timestamp("date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal").notNull(),
  gstRate: decimal("gst_rate").notNull().default('18'),
  cgst: decimal("cgst").notNull(),
  sgst: decimal("sgst").notNull(),
  total: decimal("total").notNull(),
  status: text("status").notNull().default('unpaid'),
  items: text("items").array().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  businessName: true,
});

export const insertCustomerSchema = createInsertSchema(customers);

export const insertBillSchema = createInsertSchema(bills).pick({
  customerId: true,
  billNumber: true,
  date: true,
  dueDate: true,
  subtotal: true,
  gstRate: true,
  cgst: true,
  sgst: true,
  total: true,
  status: true,
  items: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Bill = typeof bills.$inferSelect;

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type LoginCredentials = z.infer<typeof loginSchema>;


export const stockItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
  gstRate: z.number().min(0, "GST rate cannot be negative"),
});

export type StockItem = z.infer<typeof stockItemSchema>;

export const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "general"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
  metadata: z.object({
    page: z.string(),
    timestamp: z.string(),
    browserInfo: z.string()
  }).optional()
});

export type Feedback = z.infer<typeof feedbackSchema>;