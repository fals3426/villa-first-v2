#!/bin/bash
# Health Check Script for Uptime Monitoring
# Usage: ./scripts/health-check.sh [URL]

URL=${1:-http://localhost:3000}
MAX_RESPONSE_TIME=2000 # 2 seconds

response=$(curl -o /dev/null -s -w "%{http_code}\n%{time_total}" "$URL")
http_code=$(echo "$response" | head -n1)
time_total=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ] && (( $(echo "$time_total * 1000 < $MAX_RESPONSE_TIME" | bc -l) )); then
  echo "✅ Health check PASSED (${time_total}s)"
  exit 0
else
  echo "❌ Health check FAILED (HTTP: $http_code, Time: ${time_total}s)"
  exit 1
fi
