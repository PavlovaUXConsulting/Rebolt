export type PaymentMethod = "paypal" | "venmo" | "rebolt" | "ach";

export interface Recipient {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  service: "" | "paypal" | "venmo" | "rebolt" | "ach";
  // Bank details for ACH transfers
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
  accountType?: "personal" | "business";
}

export interface Transaction {
  id: string;
  recipientId: string;
  recipientName: string;
  amount: string;
  fee: string;
  total: string;
  method: PaymentMethod;
  status: "pending" | "completed" | "failed";
  reference?: string;
  createdAt: string;
}
