
import React, { useMemo } from 'react';
import { AppDB, User, Stake, Transaction } from '../types';
import { DAILY_YIELD } from '../constants';

interface DashboardProps {
  user: User;
  db: AppDB;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, db }) => {
  const userStakes = useMemo(() => db.stakes.filter(s => s.userId === user.id && !s.isCompleted), [db.stakes, user.id]);
  const userTransactions = useMemo(() => 
    db.transactions.filter(t => t.userId === user.id).sort((a, b) => b.timestamp - a.timestamp).slice(0, 5), 
    [db.transactions, user.id]
  );

  const totalStaked = userStakes.reduce((sum, s) => sum + s.amount, 0);

  // Calculate projected daily earnings
  const dailyEarnings = totalStaked * DAILY_YIELD;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <h3 className="text-slate-400 text-sm font-medium">Total Staked</h3>
          <p className="text-3xl font-bold mt-2">${totalStaked.toFixed(2)}</p>
          <div className="mt-4 flex items-center text-emerald-400 text-xs font-bold">
            <span>{userStakes.length} Active Plans</span>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <h3 className="text-slate-400 text-sm font-medium">Daily Earnings</h3>
          <p className="text-3xl font-bold mt-2 text-pink-400">${dailyEarnings.toFixed(2)}</p>
          <div className="mt-4 flex items-center text-pink-400 text-xs font-bold">
            <span>14% Daily Rate</span>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <h3 className="text-slate-400 text-sm font-medium">Status</h3>
          <p className="text-xl font-bold mt-2 capitalize">{user.status}</p>
          <div className="mt-4 flex items-center text-blue-400 text-xs font-bold">
            <span>Last Check-in: Now</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Active Stakes</h2>
        {userStakes.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-10 text-center border border-dashed border-slate-700">
            <p className="text-slate-500">No active stakes. Start earning today!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {userStakes.map(stake => {
              const daysElapsed = Math.floor((Date.now() - stake.startTime) / (1000 * 60 * 60 * 24));
              const progress = Math.min(100, (daysElapsed / stake.durationDays) * 100);
              return (
                <div key={stake.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-bold text-slate-200">${stake.amount} USDT</span>
                      <span className="text-xs text-slate-500 ml-2">Plan: {stake.planId}</span>
                    </div>
                    <span className="text-xs text-slate-400 italic">Day {daysElapsed} / {stake.durationDays}</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-pink-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Ledger</h2>
        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {userTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No transactions yet</td>
                </tr>
              ) : (
                userTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-300 capitalize">{t.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${t.type === 'reward' || t.type === 'deposit' || t.type === 'referral' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {t.type === 'reward' || t.type === 'deposit' || t.type === 'referral' ? '+' : '-'}${t.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                        t.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500">{new Date(t.timestamp).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
