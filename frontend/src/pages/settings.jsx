import Head from 'next/head';
import Link from 'next/link';

export default function Settings() {
  return (
    <>
      <Head>
        <title>Settings – FuelSync AI</title>
      </Head>
      <div className="min-h-screen bg-slate-950">
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white">← Back</Link>
            <div className="w-px h-5 bg-slate-700" />
            <h1 className="font-semibold text-white">⚙️ Settings</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4">Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1">Default Search Radius</label>
                <select className="input-field text-sm">
                  <option value="5">5 km</option>
                  <option value="10" selected>10 km</option>
                  <option value="20">20 km</option>
                  <option value="50">50 km</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1">Default City</label>
                <select className="input-field text-sm">
                  <option>Delhi</option>
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                  <option>Hyderabad</option>
                  <option>Pune</option>
                  <option>Ahmedabad</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Enable Voice Assistant</span>
                <div className="w-11 h-6 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">Dark Mode</span>
                <div className="w-11 h-6 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-white mb-3">About FuelSync AI</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Version 1.0.0</p>
              <p>AI-powered CNG pump recommendation system with real-time crowd data and wait time predictions.</p>
              <p className="text-green-400">🏆 Built for smart urban mobility</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
