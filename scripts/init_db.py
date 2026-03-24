#!/usr/bin/env python3
"""Initialize the database by creating all tables."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.db import engine, Base
import backend.models  # noqa: F401 - imports all models so they're registered


def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully.")


if __name__ == "__main__":
    init_db()
