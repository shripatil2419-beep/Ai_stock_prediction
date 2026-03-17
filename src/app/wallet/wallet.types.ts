export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: string;
}

export interface WalletState {
  balance: number;
  transactions: Transaction[];
}
