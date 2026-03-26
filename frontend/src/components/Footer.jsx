import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuel-green to-fuel-lime flex items-center justify-center text-xs">
              ⛽
            </div>
            <div>
              <p className="text-zinc-300 text-sm font-semibold">
                FuelSync <span className="text-fuel-green">AI</span>
              </p>
              <p className="text-zinc-600 text-[10px]">Smart CNG Pump Finder</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
              Home
            </Link>
            <Link
              href="/recommendations"
              className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
            >
              Recommendations
            </Link>
          </div>

          {/* Right */}
          <p className="text-zinc-700 text-[10px]">
            © 2026 FuelSync AI. Built with 💚
          </p>
        </div>
      </div>
    </footer>
  );
}
