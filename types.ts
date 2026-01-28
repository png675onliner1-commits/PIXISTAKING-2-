
export type UserStatus = 'active' | 'paused';
export type TransactionType = 'deposit' | 'withdrawal' | 'stake' | 'reward' | 'referral';
export type TransactionStatus = 'pending' | 'completed' | 'rejected';

export interface User {
  id: string;
  email: string;
  password?: string;
  walletAddress: string; // Generated BEP20 address
  balance: number;
  referralCode: string;
  referredBy?: string;
  status: UserStatus;
  isAdmin: boolean;
  createdAt: number;
}

export interface Stake {
  id: string;
  userId: string;
  amount: number;
  planId: string;
  startTime: number;
  durationDays: number;
  lastPayoutTime: number;
  isCompleted: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  description: string;
}

export interface StakingPlan {
  id: string;
  name: string;
  min: number;
  max: number;
  duration: number;
  limit: number; // 1 or 30
}

export interface AppDB {
  users: User[];
  stakes: Stake[];
  transactions: Transaction[];
}
