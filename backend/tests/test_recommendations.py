"""Tests for the recommendation engine."""
import pytest
from backend.services.recommendation_engine import (
    score_pump, get_recommendations, get_best_pick, get_trending_pumps,
    _crowd_score, _distance_score, _rating_score, _facilities_score,
)
from backend.models.pump import CngPump, PumpStatus


def make_pump(**kwargs):
    defaults = dict(
        current_crowd_level=50,
        current_vehicles=25,
        avg_rating=4.0,
        max_capacity=50,
        facilities={"air": True, "water": True, "restroom": False, "shop": False, "ev_charger": False},
        status=PumpStatus.OPEN,
        latitude=19.0760,
        longitude=72.8777,
    )
    defaults.update(kwargs)
    pump = CngPump()
    for k, v in defaults.items():
        setattr(pump, k, v)
    return pump


class TestScoringComponents:
    def test_crowd_score_low_crowd(self):
        score = _crowd_score(10)
        assert score > 35  # close to 40

    def test_crowd_score_high_crowd(self):
        score = _crowd_score(90)
        assert score < 5

    def test_crowd_score_range(self):
        for level in range(0, 101, 10):
            assert 0 <= _crowd_score(level) <= 40

    def test_distance_score_close(self):
        score = _distance_score(0.5)
        assert score > 14

    def test_distance_score_far(self):
        score = _distance_score(25.0)
        assert score == 0.0

    def test_rating_score_five_stars(self):
        score = _rating_score(5.0)
        assert score == pytest.approx(12.0)

    def test_rating_score_one_star(self):
        score = _rating_score(1.0)
        assert score == pytest.approx(0.0)

    def test_facilities_score_all(self):
        score = _facilities_score({"air": True, "water": True, "restroom": True, "shop": True, "ev_charger": True})
        assert score == pytest.approx(8.0)

    def test_facilities_score_none(self):
        score = _facilities_score({"air": False, "water": False, "restroom": False})
        assert score == pytest.approx(0.0)


class TestScorePump:
    def test_total_score_range(self):
        pump = make_pump()
        score = score_pump(pump, distance_km=2.0, hour=10)
        assert 0 <= score <= 100

    def test_less_crowded_pump_scores_higher(self):
        low_crowd = make_pump(current_crowd_level=10, current_vehicles=5)
        high_crowd = make_pump(current_crowd_level=90, current_vehicles=45)
        s1 = score_pump(low_crowd, distance_km=2.0, hour=10)
        s2 = score_pump(high_crowd, distance_km=2.0, hour=10)
        assert s1 > s2

    def test_closer_pump_scores_higher(self):
        nearby = make_pump()
        faraway = make_pump()
        s1 = score_pump(nearby, distance_km=0.5, hour=10)
        s2 = score_pump(faraway, distance_km=15.0, hour=10)
        assert s1 > s2


class TestRecommendationsIntegration:
    def test_get_recommendations_returns_sorted(self, db, sample_pump):
        results = get_recommendations(db, lat=19.1364, lng=72.8296, hour=10, radius_km=5.0)
        assert isinstance(results, list)
        if len(results) > 1:
            scores = [r["score"] for r in results]
            assert scores == sorted(scores, reverse=True)

    def test_get_best_pick(self, db, sample_pump):
        result = get_best_pick(db, lat=19.1364, lng=72.8296, hour=10)
        assert result is not None
        assert "pump" in result
        assert "score" in result

    def test_get_trending_pumps(self, db, sample_pump):
        results = get_trending_pumps(db, limit=5)
        assert isinstance(results, list)
