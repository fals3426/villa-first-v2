import * as Sentry from '@sentry/nextjs';

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

// Sentry désactivé en dev pour éviter les erreurs 429 (rate limit Sentry)
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
    beforeSend(event) {
      if (event.request) {
        if (event.request.data) {
          const sensitiveKeys = ['password', 'token', 'creditCard', 'cvv', 'apiKey', 'secret'];
          event.request.data = redactSensitiveData(event.request.data, sensitiveKeys);
        }
        if (event.request?.headers) {
          const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
          sensitiveHeaders.forEach(header => {
            if (event.request?.headers?.[header]) {
              event.request.headers[header] = '[REDACTED]';
            }
          });
        }
      }
      return event;
    },
  });
}
