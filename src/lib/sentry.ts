import * as Sentry from "@sentry/react";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!sentryDsn) return;

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
    sendDefaultPii: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function setSentryUser(userId?: string | null) {
  Sentry.setUser(userId ? { id: userId } : null);
}

export { Sentry };
