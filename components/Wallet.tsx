
import React, { useState } from 'react';
import { User, AppDB, Transaction } from '../types';

interface WalletProps {
  user: User;
  db: AppDB;
  onUpdate: (db: AppDB) => void;
}

export const Wallet: React.FC<WalletProps> = ({ user, db, onUpdate }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleWithdraw = () => {
    setMsg({ type: '', text: '' });
    const amt = parseFloat(withdrawAmount);
    
    if (isNaN(amt) || amt <= 0) {
      return setMsg({ type: 'error', text: 'Please enter a valid amount.' });
    }
    if (amt > user.balance) {
      return setMsg({ type: 'error', text: 'Insufficient balance.' });
    }
    if (!withdrawAddress.trim() || !withdrawAddress.startsWith('0x')) {
      return setMsg({ type: 'error', text: 'Please enter a valid BEP20 wallet address.' });
    }

    const newDB = { ...db };
    const userIdx = newDB.users.findIndex(u => u.id === user.id);
    newDB.users[userIdx].balance -= amt;

    const tx: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      userId: user.id,
      amount: amt,
      type: 'withdrawal',
      status: 'pending',
      timestamp: Date.now(),
      description: `Withdrawal to: ${withdrawAddress}`
    };
    newDB.transactions.push(tx);

    onUpdate(newDB);
    setMsg({ type: 'success', text: 'Withdrawal request submitted! Pending admin approval.' });
    setWithdrawAmount('');
    setWithdrawAddress('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMsg({ type: 'success', text: 'Address copied to clipboard!' });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
      {/* Recharge Section */}
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 h-fit">
        <h2 className="text-2xl font-bold mb-6">Recharge Balance</h2>
        <div className="mb-6">
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            To add funds to your PIXI account, send USDT to the personalized BEP20 address below. Your balance will be updated automatically once the transaction is confirmed on the blockchain.
          </p>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deposit Address (BEP20 USDT)</label>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center justify-between group">
            <span className="font-mono text-xs truncate mr-4 text-pink-300">{user.walletAddress}</span>
            <button 
              onClick={() => copyToClipboard(user.walletAddress)}
              className="text-pink-400 text-xs font-bold shrink-0 hover:text-pink-300 transition-colors"
            >
              Copy
            </button>
          </div>
          <div className="mt-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
            <p className="text-[11px] text-blue-300 leading-tight">
              <strong>Notice:</strong> Send only USDT to this address on the <strong>Binance Smart Chain (BEP20)</strong> network. Sending any other asset or using a different network may result in permanent loss of funds.
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
        <h2 className="text-2xl font-bold mb-6">Withdraw Funds</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Withdrawal Amount (USDT)</label>
            <input 
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none transition-all" 
              placeholder="0.00"
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-slate-500">Available Balance</p>
              <p className="text-xs text-pink-400 font-bold">${user.balance.toFixed(2)} USDT</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Receiving BEP20 Wallet Address</label>
            <input 
              type="text"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none transition-all font-mono text-sm" 
              placeholder="0x..."
            />
            <p className="text-[10px] text-slate-500 mt-2 italic">Double check your address. We are not responsible for funds sent to the wrong address.</p>
          </div>

          <button 
            onClick={handleWithdraw} 
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-pink-600/20 active:scale-[0.98]"
          >
            Request Payout
          </button>
        </div>

        {msg.text && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
};
