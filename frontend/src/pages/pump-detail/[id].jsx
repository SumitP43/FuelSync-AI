import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { pumpsApi, feedbackApi } from '../../services/api';
import usePredictions from '../../hooks/usePredictions';
import PredictionGraph from '../../components/PredictionGraph';
import CrowdIndicator from '../../components/CrowdIndicator';
import FeedbackForm from '../../components/FeedbackForm';
import CrowdReportModal from '../../components/CrowdReportModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDistance, formatWaitTime, formatRating, isOpenNow } from '../../utils/helpers';

export default function PumpDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [pump, setPump] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCrowdModal, setShowCrowdModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const { graphData, loading: graphLoading } = usePredictions(id);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      pumpsApi.getById(id),
      feedbackApi.getByPump(id),
    ])
      .then(([pumpRes, reviewRes]) => {
        setPump(pumpRes.data.data);
        setReviews(reviewRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading pump details..." />
      </div>
    );
  }

  if (!pump) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Pump not found</p>
        <Link href="/" className="btn-primary">← Back to Map</Link>
      </div>
    );
  }

  const open = isOpenNow(pump.operating_hours?.open || '06:00', pump.operating_hours?.close || '22:00');

  return (
    <>
      <Head>
        <title>{pump.name} – FuelSync AI</title>
      </Head>

      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              ← Back
            </Link>
            <div className="w-px h-5 bg-slate-700" />
            <h1 className="font-semibold text-white truncate">{pump.name}</h1>
          </div>
        </header>

        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {/* Pump Info Card */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{pump.name}</h2>
                <p className="text-slate-400 text-sm">{pump.address}, {pump.city}</p>
                {pump.phone && (
                  <a href={`tel:${pump.phone}`} className="text-green-400 text-sm mt-1 block hover:underline">
                    📞 {pump.phone}
                  </a>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <CrowdIndicator level={pump.current_crowd_level || 2} size="md" />
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${open ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {open ? '🟢 Open' : '🔴 Closed'}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold text-lg">{formatWaitTime(pump.historical_avg_wait)}</p>
                <p className="text-slate-400 text-xs">Avg Wait</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-yellow-400 font-bold text-lg">{formatRating(pump.average_rating)}</p>
                <p className="text-slate-400 text-xs">Rating ({pump.total_ratings || 0})</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-blue-400 font-bold text-lg">{pump.capacity || 2}</p>
                <p className="text-slate-400 text-xs">Dispensers</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-slate-300 font-bold text-lg">{pump.operating_hours?.open || '06:00'}</p>
                <p className="text-slate-400 text-xs">Opens at</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2">
              {pump.amenities?.washroom && <span className="badge-low">🚻 Washroom</span>}
              {pump.amenities?.shop && <span className="badge-low">🏪 Shop</span>}
              {pump.amenities?.parking && <span className="badge-low">🅿️ Parking</span>}
              {pump.amenities?.atm && <span className="badge-low">🏧 ATM</span>}
              {pump.amenities?.restaurant && <span className="badge-low">🍽️ Restaurant</span>}
            </div>
          </div>

          {/* Prediction Graph */}
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              📊 Wait Time Forecast
            </h3>
            <PredictionGraph data={graphData} loading={graphLoading} pumpName={pump.name} />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowCrowdModal(true)}
              className="btn-secondary py-3 text-sm"
            >
              📊 Report Crowd
            </button>
            <button
              onClick={() => setShowFeedback((f) => !f)}
              className="btn-primary py-3 text-sm"
            >
              ⭐ Leave Review
            </button>
          </div>

          {/* Feedback form */}
          {showFeedback && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Write a Review</h3>
              {feedbackSuccess ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="text-green-400 font-medium">Review submitted! Thank you.</p>
                  <button
                    onClick={() => { setFeedbackSuccess(false); setShowFeedback(false); }}
                    className="btn-secondary mt-3 text-sm"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <FeedbackForm
                  pumpId={pump._id}
                  onSuccess={() => setFeedbackSuccess(true)}
                />
              )}
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">
                Reviews ({reviews.length})
              </h3>
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-slate-700 pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-slate-500 text-xs">
                        {r.user_id?.username || 'Anonymous'}
                      </span>
                    </div>
                    {r.review_text && <p className="text-slate-300 text-sm">{r.review_text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCrowdModal && (
        <CrowdReportModal
          pump={pump}
          onClose={() => setShowCrowdModal(false)}
          onSuccess={() => setShowCrowdModal(false)}
        />
      )}
    </>
  );
}
