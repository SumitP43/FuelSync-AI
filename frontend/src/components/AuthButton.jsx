'use client';

import { useState, useEffect } from 'react';
import { dummyUser } from '../data/user';

export default function AuthButton() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('fuelsync_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('fuelsync_user', JSON.stringify(dummyUser));
    setUser(dummyUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('fuelsync_user');
    setUser(null);
  };

  if (!mounted) {
    return (
      <div className="h-9 w-20 rounded-lg skeleton" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuel-green to-fuel-lime flex items-center justify-center text-sm font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <span className="text-sm font-medium text-zinc-300 hidden sm:block">
            {user.name.split(' ')[0]}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800/60"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleLogin} className="btn-primary text-sm py-2 px-4">
      Sign In
    </button>
  );
}
