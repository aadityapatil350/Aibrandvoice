#!/bin/bash

# Kill process on a specific port
# Usage: ./scripts/kill-port.sh [port]

if [ -z "$1" ]; then
  echo "Usage: ./scripts/kill-port.sh [port]"
  echo "Example: ./scripts/kill-port.sh 3000"
  exit 1
fi

PORT=$1
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "✅ No process found on port $PORT"
else
  echo "🔪 Killing process $PID on port $PORT..."
  kill -9 $PID
  echo "✅ Done!"
fi
