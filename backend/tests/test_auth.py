"""Tests for authentication endpoints."""
import pytest


class TestRegister:
    def test_register_success(self, client):
        resp = client.post(
            "/api/auth/register",
            json={"email": "new@example.com", "password": "SecurePass123!", "name": "New User"},
        )
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "new@example.com"

    def test_register_duplicate_email(self, client):
        payload = {"email": "dup@example.com", "password": "SecurePass123!", "name": "User"}
        client.post("/api/auth/register", json=payload)
        resp = client.post("/api/auth/register", json=payload)
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"]

    def test_register_short_password(self, client):
        resp = client.post(
            "/api/auth/register",
            json={"email": "short@example.com", "password": "abc", "name": "User"},
        )
        assert resp.status_code == 422

    def test_register_invalid_email(self, client):
        resp = client.post(
            "/api/auth/register",
            json={"email": "not-an-email", "password": "SecurePass123!", "name": "User"},
        )
        assert resp.status_code == 422


class TestLogin:
    def test_login_success(self, client, db):
        client.post(
            "/api/auth/register",
            json={"email": "login@example.com", "password": "LoginPass123!", "name": "Login User"},
        )
        resp = client.post(
            "/api/auth/login",
            json={"email": "login@example.com", "password": "LoginPass123!"},
        )
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self, client, db):
        client.post(
            "/api/auth/register",
            json={"email": "wrongpw@example.com", "password": "CorrectPass123!", "name": "User"},
        )
        resp = client.post(
            "/api/auth/login",
            json={"email": "wrongpw@example.com", "password": "WrongPassword!"},
        )
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post(
            "/api/auth/login",
            json={"email": "ghost@example.com", "password": "AnyPassword!"},
        )
        assert resp.status_code == 401


class TestTokenValidation:
    def test_get_me_with_valid_token(self, client, user_token):
        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        assert "email" in resp.json()

    def test_get_me_without_token(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code in (401, 403)

    def test_get_me_invalid_token(self, client):
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert resp.status_code == 401

    def test_refresh_token(self, client, db):
        reg = client.post(
            "/api/auth/register",
            json={"email": "refresh@example.com", "password": "RefreshPass123!", "name": "Refresh User"},
        )
        refresh_token = reg.json()["refresh_token"]
        resp = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
        assert resp.status_code == 200
        assert "access_token" in resp.json()
