
import React, { useState } from 'react';
import { User, AppDB, Stake, Transaction } from '../types';
import { STAKING_PLANS } from '../constants';

interface StakingPlansProps {
  user: User;
  db: AppDB;
  onUpdate: (db: AppDB) => void;
}

export const StakingPlans: React.FC<StakingPlansProps> = ({ user, db, onUpdate }) => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStake = (planId: string) => {
    setError(null);
    setSuccess(null);
    const plan = STAKING_PLANS.find(p => p.id === planId);
    if (!plan) return;

    const stakeAmount = parseFloat(amount);
    if (isNaN(stakeAmount) || stakeAmount < plan.min || stakeAmount > plan.max) {
      setError(`Invalid amount. For this plan, amount must be between ${plan.min} and ${plan.max} USDT.`);
      return;
    }

    if (user.balance < stakeAmount) {
      setError("Insufficient balance.");
      return;
    }

    if (user.status === 'paused') {
      setError("Your account activity is currently paused by admin.");
      return;
    }

    // Check plan limits
    const existingStakesCount = db.stakes.filter(s => s.userId === user.id && s.planId === planId).length;
    if (existingStakesCount >= plan.limit) {
      setError(`You have reached the maximum limit of ${plan.limit} stakes for this plan.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newDB = { ...db };
      const userIdx = newDB.users.findIndex(u => u.id === user.id);
      
      // Deduct balance
      newDB.users[userIdx].balance -= stakeAmount;

      // Create stake
      const newStake: Stake = {
        id: Math.random().toString(36).substring(2, 9),
        userId: user.id,
        amount: stakeAmount,
        planId: plan.id,
        startTime: Date.now(),
        durationDays: plan.duration,
        lastPayoutTime: Date.now(),
        isCompleted: false
      };
      newDB.stakes.push(newStake);

      // Create transaction
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        userId: user.id,
        amount: stakeAmount,
        type: 'stake',
        status: 'completed',
        timestamp: Date.now(),
        description: `Staked in ${plan.name}`
      };
      newDB.transactions.push(newTx);

      onUpdate(newDB);
      setLoading(false);
      setSuccess("Successfully staked!");
      setAmount('');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Flexible Staking Plans</h2>
        <p className="text-slate-400 mt-2">Earn up to 14% daily returns on your USDT deposits.</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <label className="block text-sm font-medium text-slate-400 mb-2">Investment Amount (USDT)</label>
        <div className="flex gap-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
        {error && <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>}
        {success && <p className="text-emerald-400 text-xs mt-2 font-medium">{success}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STAKING_PLANS.map(plan => {
          const isEligible = parseFloat(amount) >= plan.min && parseFloat(amount) <= plan.max;
          return (
            <div key={plan.id} className={`p-6 rounded-3xl border transition-all ${isEligible ? 'bg-pink-600/10 border-pink-500 ring-1 ring-pink-500' : 'bg-slate-800 border-slate-700 opacity-80'}`}>
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{plan.duration} Days Duration</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Daily Payout</span>
                  <span className="text-pink-400 font-bold">14%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Min - Max</span>
                  <span className="text-slate-200">${plan.min} - ${plan.max}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Limit</span>
                  <span className="text-slate-200">{plan.limit} Time(s)</span>
                </div>
              </div>

              <button
                disabled={!isEligible || loading}
                onClick={() => handleStake(plan.id)}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  isEligible 
                  ? 'bg-pink-500 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/30' 
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {loading ? 'Processing...' : 'Invest Now'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
