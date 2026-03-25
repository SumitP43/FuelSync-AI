import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import RecommendationCard from '../../components/RecommendationCard';
import InsightsPanel from '../../components/InsightsPanel';
import { getRecommendedPumps } from '../../data/pumps';

export const metadata = {
  title: 'Best Pumps Near You — FuelSync AI',
  description: 'AI-powered CNG pump recommendations. Find the best pumps ranked by distance, wait time, price, and crowd levels.',
};

export default function RecommendationsPage() {
  const recommended = getRecommendedPumps();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4 animate-fade-in">
            <span className="text-sm">🧠</span>
            <span className="text-violet-400 text-xs font-medium">AI Recommendations</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 animate-slide-up">
            Best Pumps{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuel-green to-fuel-lime">
              Near You
            </span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-lg animate-slide-up" style={{ animationDelay: '100ms' }}>
            Our AI analyzes distance, waiting time, pricing, and crowd data to recommend 
            the best stations for you right now.
          </p>
        </div>

        {/* AI Insights */}
        <div className="mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <InsightsPanel />
        </div>

        {/* Recommendations grid */}
        <div className="mb-4">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            🏆 Top {recommended.length} Stations
          </h2>
          <p className="text-zinc-500 text-xs mt-1">Ranked by AI score (higher is better)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recommended.map((pump, i) => (
            <RecommendationCard key={pump.id} pump={pump} rank={i + 1} index={i} />
          ))}
        </div>

        {/* How it works */}
        <div className="mt-16 glass rounded-2xl p-8">
          <h3 className="text-white font-semibold text-lg mb-6 text-center">
            How AI Scoring Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📍', title: 'Distance', desc: 'Closer stations get higher scores' },
              { icon: '⏱', title: 'Wait Time', desc: 'Shorter queues rank much higher' },
              { icon: '⭐', title: 'Rating', desc: 'User ratings boost the score' },
              { icon: '💰', title: 'Price', desc: 'Better prices give extra points' },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${i * 100 + 300}ms`, animationFillMode: 'both' }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>
                <p className="text-zinc-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
