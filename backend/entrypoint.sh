#!/bin/bash

# Wait for database to be ready
while ! nc -z db 5432; do
  sleep 1
done

echo "Database is ready!"

# Run migrations
python -m alembic upgrade head

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000
