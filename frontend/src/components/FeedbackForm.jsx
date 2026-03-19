import { useState } from 'react';
import { feedbackApi } from '../services/api';

const FeedbackForm = ({ pumpId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setError('Please select a rating');
    setLoading(true);
    setError('');
    try {
      await feedbackApi.submit({ pump_id: pumpId, rating, review_text: review });
      setRating(0);
      setReview('');
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <span className={(hover || rating) >= star ? 'text-yellow-400' : 'text-slate-600'}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-slate-400 text-sm ml-2">
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
          </span>
        )}
      </div>

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share your experience (optional)"
        rows={3}
        maxLength={500}
        className="input-field resize-none text-sm"
      />

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default FeedbackForm;
