export interface Bill {
  id: string;
  doctorName: string;
  billingProvider?: string;
  billNumber?: string;
  date: string;          // Format: YYYY-MM-DD
  dueDate?: string;      // Format: YYYY-MM-DD
  amount: number;        // Euro-Betrag
  forwardedToDkv?: boolean;
  forwardedDate?: string;
}

export interface GroupedBills {
  doctorName: string;
  bills: Bill[];
  totalAmount: number;
}
