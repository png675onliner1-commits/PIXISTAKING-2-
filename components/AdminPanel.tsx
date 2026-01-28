
import React from 'react';
import { AppDB, User, Transaction } from '../types';

interface AdminPanelProps {
  db: AppDB;
  onUpdate: (db: AppDB) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ db, onUpdate }) => {
  const pendingWithdrawals = db.transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');

  const toggleUserStatus = (userId: string) => {
    const newDB = { ...db };
    const userIdx = newDB.users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      newDB.users[userIdx].status = newDB.users[userIdx].status === 'active' ? 'paused' : 'active';
      onUpdate(newDB);
    }
  };

  const approveWithdrawal = (txId: string) => {
    const newDB = { ...db };
    const txIdx = newDB.transactions.findIndex(t => t.id === txId);
    if (txIdx !== -1) {
      newDB.transactions[txIdx].status = 'completed';
      onUpdate(newDB);
    }
  };

  const rejectWithdrawal = (txId: string) => {
    const newDB = { ...db };
    const txIdx = newDB.transactions.findIndex(t => t.id === txId);
    if (txIdx !== -1) {
      const tx = newDB.transactions[txIdx];
      // Refund the user balance if rejected
      const userIdx = newDB.users.findIndex(u => u.id === tx.userId);
      if (userIdx !== -1) {
        newDB.users[userIdx].balance += tx.amount;
      }
      newDB.transactions[txIdx].status = 'rejected';
      onUpdate(newDB);
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Pending Withdrawals</h2>
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">User ID</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {pendingWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">No pending requests</td>
                </tr>
              ) : (
                pendingWithdrawals.map(tx => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 font-mono text-xs">{tx.userId}</td>
                    <td className="px-6 py-4 font-bold text-pink-400">${tx.amount}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                      <button onClick={() => approveWithdrawal(tx.id)} className="px-3 py-1 bg-emerald-600 text-[10px] font-bold rounded uppercase">Approve</button>
                      <button onClick={() => rejectWithdrawal(tx.id)} className="px-3 py-1 bg-red-600 text-[10px] font-bold rounded uppercase">Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">User Management</h2>
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Activity Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {db.users.filter(u => !u.isAdmin).map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 font-bold text-slate-200">${user.balance.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        user.status === 'active' ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                    >
                      {user.status === 'active' ? 'Pause Account' : 'Resume Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
