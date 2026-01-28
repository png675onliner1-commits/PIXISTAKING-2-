
import React from 'react';
import { User, AppDB } from '../types';

interface ReferralsProps {
  user: User;
  db: AppDB;
}

export const Referrals: React.FC<ReferralsProps> = ({ user, db }) => {
  const referrals = db.users.filter(u => u.referredBy === user.referralCode);
  const refCommissionTotal = db.transactions
    .filter(t => t.userId === user.id && t.type === 'referral')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Refer & Earn 10%</h2>
          <p className="text-indigo-100 max-w-md">Share your link and earn a 10% commission on every deposit your friends make!</p>
          
          <div className="mt-8">
            <label className="text-xs font-bold uppercase text-indigo-300">Your Referral Link</label>
            <div className="mt-2 flex">
              <input 
                readOnly
                value={`https://pixistaking.app/#/signup?ref=${user.referralCode}`}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-l-xl px-4 py-3 flex-1 text-sm outline-none text-white"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://pixistaking.app/#/signup?ref=${user.referralCode}`);
                  alert('Referral link copied!');
                }}
                className="bg-white text-indigo-700 px-6 font-bold rounded-r-xl text-sm hover:bg-indigo-50 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
          <p className="text-slate-400 text-sm">Total Referrals</p>
          <p className="text-3xl font-bold mt-1">{referrals.length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
          <p className="text-slate-400 text-sm">Earned Commission</p>
          <p className="text-3xl font-bold mt-1 text-emerald-400">${refCommissionTotal.toFixed(2)} <span className="text-xs">USDT</span></p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
        <h3 className="px-6 py-4 font-bold border-b border-slate-700">My Network</h3>
        <table className="w-full text-left">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">User</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No referrals yet</td>
              </tr>
            ) : (
              referrals.map(ref => (
                <tr key={ref.id}>
                  <td className="px-6 py-4 text-sm font-medium">{ref.email}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{new Date(ref.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">{ref.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
