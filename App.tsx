
import React, { useState, useEffect, useCallback } from 'react';
import { User, AppDB, Stake, Transaction } from './types';
import { getDB, saveDB, generateWallet, generateReferralCode } from './services/db';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StakingPlans } from './components/StakingPlans';
import { Wallet } from './components/Wallet';
import { Referrals } from './components/Referrals';
import { AdminPanel } from './components/AdminPanel';
import { DAILY_YIELD, REFERRAL_COMMISSION } from './constants';

const App: React.FC = () => {
  const [db, setDb] = useState<AppDB>(getDB());
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [refCodeInput, setRefCodeInput] = useState('');

  // Handle Rewards Calculation on every load/login
  const processRewards = useCallback((currentDB: AppDB) => {
    let hasChanges = false;
    const newDB = { ...currentDB };
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    newDB.stakes = newDB.stakes.map(stake => {
      if (stake.isCompleted) return stake;

      const timeSinceLastPayout = now - stake.lastPayoutTime;
      const daysDue = Math.floor(timeSinceLastPayout / dayMs);

      if (daysDue > 0) {
        hasChanges = true;
        const reward = stake.amount * DAILY_YIELD * daysDue;
        
        // Add to user balance
        const userIdx = newDB.users.findIndex(u => u.id === stake.userId);
        if (userIdx !== -1) {
          newDB.users[userIdx].balance += reward;

          // Add reward transaction
          newDB.transactions.push({
            id: Math.random().toString(36).substring(2, 9),
            userId: stake.userId,
            amount: reward,
            type: 'reward',
            status: 'completed',
            timestamp: now,
            description: `Daily 14% yield for ${stake.planId}`
          });
        }

        // Check if stake is completed based on startTime and duration
        const totalElapsed = now - stake.startTime;
        const totalDaysElapsed = Math.floor(totalElapsed / dayMs);
        const isCompleted = totalDaysElapsed >= stake.durationDays;

        return {
          ...stake,
          lastPayoutTime: stake.lastPayoutTime + (daysDue * dayMs),
          isCompleted
        };
      }
      return stake;
    });

    if (hasChanges) {
      setDb(newDB);
      saveDB(newDB);
      // Update local user state if logged in
      if (user) {
        const updatedUser = newDB.users.find(u => u.id === user.id);
        if (updatedUser) setUser(updatedUser);
      }
    }
  }, [user]);

  useEffect(() => {
    processRewards(db);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = db.users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      processRewards(db);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.users.find(u => u.email === email)) {
      return alert("Email already exists");
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      email,
      password,
      walletAddress: generateWallet(),
      balance: 0,
      referralCode: generateReferralCode(),
      referredBy: refCodeInput || undefined,
      status: 'active',
      isAdmin: false,
      createdAt: Date.now()
    };

    const newDB = { ...db, users: [...db.users, newUser] };
    setDb(newDB);
    saveDB(newDB);
    setUser(newUser);
  };

  const onDBUpdate = (updatedDB: AppDB) => {
    setDb(updatedDB);
    saveDB(updatedDB);
    if (user) {
      const updatedUser = updatedDB.users.find(u => u.id === user.id);
      if (updatedUser) setUser(updatedUser);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-pink-900/10 to-slate-900">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center font-bold text-3xl text-white italic mb-4 shadow-xl shadow-pink-500/20">P</div>
            <h1 className="text-3xl font-extrabold tracking-tight">PIXI STAKING</h1>
            <p className="text-slate-400 text-sm mt-1">Institutional Yield for Everyone</p>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Email</label>
              <input 
                required
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 transition-all" 
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Password</label>
              <input 
                required
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 transition-all" 
                placeholder="••••••••"
              />
            </div>
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 ml-1">Referral Code (Optional)</label>
                <input 
                  type="text" 
                  value={refCodeInput} 
                  onChange={e => setRefCodeInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 transition-all" 
                  placeholder="EX: PIXI-123"
                />
              </div>
            )}
            <button className="w-full bg-pink-500 hover:bg-pink-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/20 transition-all active:scale-95">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-slate-400 hover:text-white underline underline-offset-4 decoration-pink-500"
            >
              {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      user={user} 
      onLogout={() => setUser(null)} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && <Dashboard user={user} db={db} />}
      {activeTab === 'stake' && <StakingPlans user={user} db={db} onUpdate={onDBUpdate} />}
      {activeTab === 'wallet' && <Wallet user={user} db={db} onUpdate={onDBUpdate} />}
      {activeTab === 'referrals' && <Referrals user={user} db={db} />}
      {activeTab === 'admin' && user.isAdmin && <AdminPanel db={db} onUpdate={onDBUpdate} />}
    </Layout>
  );
};

export default App;
