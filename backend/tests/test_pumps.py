"""Tests for pump endpoints."""
import pytest


class TestListPumps:
    def test_list_pumps_empty(self, client):
        resp = client.get("/api/pumps/")
        assert resp.status_code == 200
        assert resp.json()["pumps"] == []

    def test_list_pumps_with_data(self, client, sample_pump):
        resp = client.get("/api/pumps/")
        assert resp.status_code == 200
        pumps = resp.json()["pumps"]
        assert len(pumps) == 1
        assert pumps[0]["name"] == "Test CNG Station"

    def test_filter_by_city(self, client, sample_pump):
        resp = client.get("/api/pumps/?city=Mumbai")
        assert resp.status_code == 200
        assert len(resp.json()["pumps"]) == 1

        resp2 = client.get("/api/pumps/?city=Delhi")
        assert resp2.status_code == 200
        assert len(resp2.json()["pumps"]) == 0

    def test_filter_by_status(self, client, sample_pump):
        resp = client.get("/api/pumps/?status=open")
        assert resp.status_code == 200
        assert len(resp.json()["pumps"]) == 1

    def test_pagination(self, client, sample_pump):
        resp = client.get("/api/pumps/?limit=1&offset=0")
        assert resp.status_code == 200
        assert len(resp.json()["pumps"]) == 1

        resp2 = client.get("/api/pumps/?limit=1&offset=1")
        assert resp2.status_code == 200
        assert len(resp2.json()["pumps"]) == 0


class TestGetPump:
    def test_get_existing_pump(self, client, sample_pump):
        resp = client.get(f"/api/pumps/{sample_pump.id}")
        assert resp.status_code == 200
        assert resp.json()["id"] == str(sample_pump.id)
        assert resp.json()["name"] == "Test CNG Station"

    def test_get_nonexistent_pump(self, client):
        resp = client.get("/api/pumps/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404


class TestNearbyPumps:
    def test_nearby_within_radius(self, client, sample_pump):
        # Andheri West coordinates, pump should be within 1 km
        resp = client.get("/api/pumps/nearby?lat=19.1364&lng=72.8296&radius=1.0")
        assert resp.status_code == 200
        assert len(resp.json()["pumps"]) == 1

    def test_nearby_outside_radius(self, client, sample_pump):
        # Far away location
        resp = client.get("/api/pumps/nearby?lat=28.6139&lng=77.2090&radius=5.0")
        assert resp.status_code == 200
        assert len(resp.json()["pumps"]) == 0


class TestAdminPumpCRUD:
    def test_create_pump_as_admin(self, client, admin_token):
        resp = client.post(
            "/api/pumps/",
            json={
                "name": "New Pump",
                "area": "Bandra",
                "city": "Mumbai",
                "address": "Bandra West, Mumbai",
                "latitude": 19.0544,
                "longitude": 72.8407,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "New Pump"

    def test_create_pump_as_regular_user(self, client, user_token):
        resp = client.post(
            "/api/pumps/",
            json={
                "name": "Unauthorized Pump",
                "area": "Bandra",
                "city": "Mumbai",
                "address": "Bandra West, Mumbai",
                "latitude": 19.0544,
                "longitude": 72.8407,
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert resp.status_code == 403

    def test_delete_pump_as_admin(self, client, admin_token, sample_pump):
        resp = client.delete(
            f"/api/pumps/{sample_pump.id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 204

    def test_update_pump_as_admin(self, client, admin_token, sample_pump):
        resp = client.put(
            f"/api/pumps/{sample_pump.id}",
            json={"name": "Updated Pump Name"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Pump Name"
