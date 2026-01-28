
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  if (!user) return <>{children}</>;

  const navItems = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'stake', name: 'Staking Plans' },
    { id: 'wallet', name: 'Wallet' },
    { id: 'referrals', name: 'Referrals' },
  ];

  if (user.isAdmin) {
    navItems.push({ id: 'admin', name: 'Admin Panel' });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center font-bold text-white italic">P</div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">PIXI STAKING</span>
          </div>
          <button onClick={onLogout} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign Out</button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row container mx-auto px-4 py-8">
        <aside className="w-full md:w-64 mb-8 md:mb-0">
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Your Balance</p>
            <p className="text-2xl font-bold text-pink-400">${user.balance.toFixed(2)} <span className="text-xs text-slate-500">USDT</span></p>
            <p className="text-xs text-slate-400 mt-2 truncate font-mono">{user.walletAddress}</p>
          </div>
        </aside>

        <main className="flex-1 md:pl-10">
          {children}
        </main>
      </div>
      
      <footer className="bg-slate-800 py-6 mt-auto border-t border-slate-700">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} PIXI STAKING. All rewards calculated daily at 14%.
        </div>
      </footer>
    </div>
  );
};
