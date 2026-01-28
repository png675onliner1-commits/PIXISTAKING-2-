
import { AppDB, User, Stake, Transaction } from '../types';

const DB_KEY = 'pixi_staking_db_v1';

const INITIAL_DB: AppDB = {
  users: [
    {
      id: 'admin-root',
      email: 'admin@pixi.com',
      password: 'admin',
      walletAddress: '0xADMIN_TREASURY_WALLET',
      balance: 0,
      referralCode: 'ADMIN',
      status: 'active',
      isAdmin: true,
      createdAt: Date.now()
    }
  ],
  stakes: [],
  transactions: []
};

export const getDB = (): AppDB => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : INITIAL_DB;
};

export const saveDB = (db: AppDB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const generateWallet = (): string => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * 16)];
  }
  return address;
};

export const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
