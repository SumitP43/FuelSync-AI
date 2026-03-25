import Navbar from '../components/Navbar';
import StatsBar from '../components/StatsBar';
import MapWrapper from '../components/MapWrapper';
import InsightsPanel from '../components/InsightsPanel';
import PumpList from '../components/PumpList';
import Footer from '../components/Footer';
import { getRecommendedPumps } from '../data/pumps';
import RecommendationCard from '../components/RecommendationCard';

export default function Home() {
  const topPicks = getRecommendedPumps().slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-fuel-green/5 via-transparent to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuel-green/10 border border-fuel-green/20 mb-6 animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-fuel-green animate-pulse" />
                <span className="text-fuel-green text-xs font-medium">AI-Powered • Live Data</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 animate-slide-up">
                Find the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuel-green to-fuel-lime">
                  best CNG pump
                </span>{' '}
                near you
              </h1>
              <p className="text-zinc-400 text-base sm:text-lg max-w-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
                Smart recommendations powered by AI. Real-time crowd data, price tracking, 
                and wait time predictions across Delhi NCR.
              </p>
            </div>
          </div>
        </section>

        {/* Stats + Map */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <StatsBar />
              <MapWrapper />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <InsightsPanel />
              {/* Quick picks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    🏆 Top Picks
                  </h3>
                  <a
                    href="/recommendations"
                    className="text-fuel-green text-xs font-medium hover:underline"
                  >
                    View all →
                  </a>
                </div>
                <div className="space-y-3">
                  {topPicks.map((pump, i) => (
                    <RecommendationCard key={pump.id} pump={pump} rank={i + 1} index={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Pumps */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <div className="mb-8">
            <h2 className="text-white font-bold text-2xl mb-1">All CNG Stations</h2>
            <p className="text-zinc-500 text-sm">Browse and filter all stations in Delhi NCR</p>
          </div>
          <PumpList />
        </section>
      </main>

      <Footer />
    </div>
  );
}
