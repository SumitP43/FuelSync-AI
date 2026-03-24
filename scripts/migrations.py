#!/usr/bin/env python3
"""Database migration utilities."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def run_migrations():
    """Apply all pending Alembic migrations."""
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
    print("✅ Migrations applied.")


def create_migration(message: str = "auto migration"):
    """Generate a new Alembic migration."""
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config("alembic.ini")
    command.revision(alembic_cfg, autogenerate=True, message=message)
    print(f"✅ Migration created: {message}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "create":
        msg = " ".join(sys.argv[2:]) or "auto migration"
        create_migration(msg)
    else:
        run_migrations()
