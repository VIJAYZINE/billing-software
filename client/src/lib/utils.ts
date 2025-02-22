import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number to Indian currency format with ₹ symbol
export function formatIndianCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

// Calculate GST for a given amount (assuming 18% GST)
export function calculateGST(amount: number): { cgst: number; sgst: number; total: number } {
  const baseAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const gstRate = 0.18; // 18% GST (9% CGST + 9% SGST)
  const cgst = baseAmount * (gstRate / 2);
  const sgst = baseAmount * (gstRate / 2);
  return {
    cgst,
    sgst,
    total: baseAmount + cgst + sgst
  };
}