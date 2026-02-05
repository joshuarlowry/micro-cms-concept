#!/bin/bash

echo "Database is ready! Running migrations..."

# Run migrations
python -m alembic upgrade head

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000
