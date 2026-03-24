"""FuelSync-AI package setup."""
from setuptools import setup, find_packages

setup(
    name="fuelsync-ai",
    version="1.0.0",
    description="Smart CNG Pump Finder & Optimizer with AI recommendations",
    author="FuelSync Team",
    python_requires=">=3.11",
    packages=find_packages(exclude=["tests*", "scripts*"]),
    install_requires=[
        "fastapi>=0.111.0",
        "uvicorn[standard]>=0.30.0",
        "sqlalchemy>=2.0.30",
        "pydantic>=2.7.1",
        "pydantic-settings>=2.3.1",
        "pydantic[email]>=2.7.1",
        "python-jose[cryptography]>=3.3.0",
        "bcrypt>=4.1.3",
        "psycopg2-binary>=2.9.9",
        "anthropic>=0.28.0",
        "httpx>=0.27.0",
        "python-multipart>=0.0.9",
    ],
    extras_require={
        "dev": [
            "pytest>=8.2.1",
            "pytest-asyncio>=0.23.7",
            "pytest-cov>=5.0.0",
        ]
    },
    classifiers=[
        "Programming Language :: Python :: 3.11",
        "Framework :: FastAPI",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
    ],
)
