import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event, hint) {
    // Redact sensitive data
    if (event.request) {
      if (event.request.data) {
        const sensitiveKeys = ['password', 'token', 'creditCard', 'cvv', 'apiKey', 'secret', 'stripeSecretKey'];
        event.request.data = redactSensitiveData(event.request.data, sensitiveKeys);
      }
    }
    return event;
  },
});

function redactSensitiveData(obj: any, keys: string[]): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (keys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key], keys);
    }
  }
  return redacted;
}
