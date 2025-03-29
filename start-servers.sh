#!/bin/bash

# Start Flask backend
echo "Starting Flask backend..."
cd ..
source venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --port 5002 &

# Start Next.js frontend
echo "Starting Next.js frontend..."
cd audio-converter
npm run dev &

# Wait for both processes
wait 