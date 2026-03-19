import Head from 'next/head';
import Link from 'next/link';

export default function MyFavorites() {
  return (
    <>
      <Head>
        <title>My Favorites – FuelSync AI</title>
      </Head>
      <div className="min-h-screen bg-slate-950">
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white">← Back</Link>
            <div className="w-px h-5 bg-slate-700" />
            <h1 className="font-semibold text-white">❤️ My Favorites</h1>
          </div>
        </header>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="text-5xl mb-4">❤️</div>
          <h2 className="text-white font-semibold text-xl mb-2">No favorites yet</h2>
          <p className="text-slate-400 mb-6">Save your frequently visited pumps for quick access</p>
          <Link href="/" className="btn-primary">Browse Pumps</Link>
        </div>
      </div>
    </>
  );
}
