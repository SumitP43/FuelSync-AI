"""Pytest configuration and shared fixtures."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database.db import Base, get_db
from backend.app import app

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Test client with overridden DB dependency."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token(client, db):
    """Create an admin user and return JWT token."""
    from backend.models.user import User, UserRole
    import bcrypt
    hashed = bcrypt.hashpw(b"AdminPass123!", bcrypt.gensalt()).decode()
    admin = User(
        email="admin@fuelsync-test.com",
        password_hash=hashed,
        name="Admin User",
        role=UserRole.ADMIN,
    )
    db.add(admin)
    db.commit()
    resp = client.post("/api/auth/login", json={"email": "admin@fuelsync-test.com", "password": "AdminPass123!"})
    return resp.json()["access_token"]


@pytest.fixture
def user_token(client, db):
    """Create a regular user and return JWT token."""
    resp = client.post(
        "/api/auth/register",
        json={"email": "user@fuelsync-test.com", "password": "UserPass123!", "name": "Test User"},
    )
    return resp.json()["access_token"]


@pytest.fixture
def sample_pump(db):
    """Insert a sample CNG pump into the database."""
    from backend.models.pump import CngPump, PumpStatus
    pump = CngPump(
        name="Test CNG Station",
        area="Andheri West",
        city="Mumbai",
        address="Test Address, Andheri West, Mumbai",
        latitude=19.1364,
        longitude=72.8296,
        is_24x7=True,
        facilities={"air": True, "water": True, "restroom": False, "shop": True, "ev_charger": False},
        current_crowd_level=35,
        max_capacity=50,
        current_vehicles=18,
        status=PumpStatus.OPEN,
        avg_rating=4.2,
        review_count=15,
    )
    db.add(pump)
    db.commit()
    db.refresh(pump)
    return pump
