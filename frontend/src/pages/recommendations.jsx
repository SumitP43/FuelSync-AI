import Head from 'next/head';
import Link from 'next/link';
import useLocation from '../hooks/useLocation';
import useRecommendations from '../hooks/useRecommendations';
import PumpCard from '../components/PumpCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatWaitTime } from '../utils/helpers';

export default function Recommendations() {
  const { location } = useLocation();
  const { recommendations, loading, error, refetch } = useRecommendations(location);

  return (
    <>
      <Head>
        <title>AI Recommendations – FuelSync AI</title>
      </Head>

      <div className="min-h-screen bg-slate-950">
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white">← Back</Link>
            <div className="w-px h-5 bg-slate-700" />
            <h1 className="font-semibold text-white">🧠 AI Recommendations</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto p-4">
          {/* How it works */}
          <div className="card p-4 mb-4 bg-green-500/5 border-green-500/20">
            <h3 className="text-green-400 font-semibold text-sm mb-2">How our AI ranks pumps</h3>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-slate-800 rounded-lg p-2">
                <div className="text-2xl mb-1">📍</div>
                <div className="text-slate-300 font-medium">Distance</div>
                <div className="text-slate-500">30% weight</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-2 ring-1 ring-green-500/50">
                <div className="text-2xl mb-1">⏱</div>
                <div className="text-slate-300 font-medium">Wait Time</div>
                <div className="text-green-500">50% weight</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-2">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-slate-300 font-medium">Ratings</div>
                <div className="text-slate-500">20% weight</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Calculating best pumps for you..." />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">
              <p>{error}</p>
              <button onClick={refetch} className="btn-secondary mt-4">Retry</button>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="text-5xl mb-3">⛽</div>
              <p>No pumps found nearby</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((pump, i) => (
                <Link key={pump._id} href={`/pump-detail/${pump._id}`}>
                  <PumpCard pump={pump} rank={i + 1} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
