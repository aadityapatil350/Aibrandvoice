#!/bin/bash

# Cleanup script to kill all Node processes on common development ports
# Usage: ./scripts/cleanup-ports.sh

echo "🧹 Cleaning up development ports..."

# Array of common ports to clean
PORTS=(3000 3001 3002 3003 3004 3005 4000 5000 8000 8080 4200 5173 5174)

KILLED=0

for port in "${PORTS[@]}"; do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ ! -z "$PID" ]; then
    echo "  Killing process $PID on port $port..."
    kill -9 $PID 2>/dev/null
    ((KILLED++))
  fi
done

if [ $KILLED -eq 0 ]; then
  echo "✅ All ports are clean!"
else
  echo "✅ Killed $KILLED process(es)"
fi

# Also show any remaining Node processes
REMAINING=$(ps aux | grep -E "[n]ode.*next" | wc -l | tr -d ' ')
if [ "$REMAINING" -gt 0 ]; then
  echo ""
  echo "⚠️  There are still $REMAINING Node processes running:"
  ps aux | grep -E "[n]ode.*next" | awk '{print "  PID:", $2, "-", $11, $12, $13, $14}'
fi
