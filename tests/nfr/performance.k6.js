import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const searchDuration = new Trend('search_duration');
const paymentDuration = new Trend('payment_duration');
const checkinDuration = new Trend('checkin_duration');

// Performance thresholds (PRD requirements)
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Spike to 100 users (MVP target)
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    // PRD thresholds
    search_duration: ['p(95)<1000'],   // < 1 seconde (recherche annonces)
    payment_duration: ['p(95)<5000'],  // < 5 secondes (paiement)
    checkin_duration: ['p(95)<3000'],  // < 3 secondes (check-in)
    errors: ['rate<0.01'],             // < 1% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Search performance (< 1s) - PRD requirement
  const searchResponse = http.get(`${BASE_URL}/api/listings/search?location=bali&limit=10`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const searchTime = searchResponse.timings.duration;
  searchDuration.add(searchTime);

  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search responds in <1s': (r) => r.timings.duration < 1000,
  });
  errorRate.add(searchResponse.status !== 200);

  // Test 2: Payment preauthorization performance (< 5s) - PRD requirement
  const paymentResponse = http.post(
    `${BASE_URL}/api/bookings/test-booking-id/payment/preauthorize`,
    JSON.stringify({
      amount: 25,
      listingId: 'test-listing-id',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  paymentDuration.add(paymentResponse.timings.duration);

  check(paymentResponse, {
    'payment status is 200 or 201 or 401': (r) => [200, 201, 401].includes(r.status),
    'payment responds in <5s': (r) => r.timings.duration < 5000,
  });
  errorRate.add(paymentResponse.status >= 500);

  // Test 3: Check-in performance (< 3s) - PRD requirement
  const checkinResponse = http.post(
    `${BASE_URL}/api/bookings/test-booking-id/checkin`,
    JSON.stringify({
      photo: 'base64-encoded-photo-placeholder',
      coordinates: { lat: -8.4095, lng: 115.1889 },
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  checkinDuration.add(checkinResponse.timings.duration);

  check(checkinResponse, {
    'checkin status is 200 or 201 or 401': (r) => [200, 201, 401].includes(r.status),
    'checkin responds in <3s': (r) => r.timings.duration < 3000,
  });
  errorRate.add(checkinResponse.status >= 500);

  sleep(1);
}

export function handleSummary(data) {
  const p95Search = data.metrics.search_duration.values['p(95)'];
  const p95Payment = data.metrics.payment_duration.values['p(95)'];
  const p95Checkin = data.metrics.checkin_duration.values['p(95)'];
  const errorRateValue = data.metrics.errors.values.rate;

  return {
    'summary.json': JSON.stringify(data),
    stdout: `
Performance NFR Results:
- Search p95: ${p95Search < 1000 ? '✅ PASS' : '❌ FAIL'} (${p95Search.toFixed(2)}ms / 1000ms threshold)
- Payment p95: ${p95Payment < 5000 ? '✅ PASS' : '❌ FAIL'} (${p95Payment.toFixed(2)}ms / 5000ms threshold)
- Check-in p95: ${p95Checkin < 3000 ? '✅ PASS' : '❌ FAIL'} (${p95Checkin.toFixed(2)}ms / 3000ms threshold)
- Error rate: ${errorRateValue < 0.01 ? '✅ PASS' : '❌ FAIL'} (${(errorRateValue * 100).toFixed(2)}% / 1% threshold)
    `,
  };
}
