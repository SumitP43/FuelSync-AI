'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthButton from './AuthButton';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuel-green to-fuel-lime flex items-center justify-center text-lg shadow-lg shadow-fuel-green/20 group-hover:scale-105 transition-transform">
              ⛽
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none tracking-tight">
                FuelSync
                <span className="text-fuel-green"> AI</span>
              </h1>
              <p className="text-zinc-500 text-[10px] font-medium tracking-wider uppercase">
                Smart CNG Finder
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
            >
              Home
            </Link>
            <Link
              href="/recommendations"
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
            >
              Recommendations
            </Link>
            <div className="w-px h-6 bg-zinc-700 mx-2" />
            <AuthButton />
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span
                className={`block h-0.5 bg-zinc-300 transition-all duration-300 ${
                  mobileOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-zinc-300 transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 bg-zinc-300 transition-all duration-300 ${
                  mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-64 border-t border-zinc-800/50' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all"
          >
            🏠 Home
          </Link>
          <Link
            href="/recommendations"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all"
          >
            🧠 Recommendations
          </Link>
          <div className="pt-2 border-t border-zinc-800">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
