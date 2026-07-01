import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import { App } from "@/App";
import { AuthProvider } from "@/components/auth-provider";
import { SyncProvider } from "@/components/sync-provider";
import { ToastProvider } from "@/components/ui/toast";
import { I18nProvider } from "@/lib/i18n";
import { registerServiceWorker } from "@/lib/register-service-worker";
import { initSentry, Sentry } from "@/lib/sentry";
import "@/index.css";

initSentry();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
          <div className="max-w-sm space-y-2">
            <p className="font-display text-2xl font-bold uppercase">Ada kendala</p>
            <p className="text-sm text-muted-foreground">Muat ulang halaman untuk melanjutkan latihan</p>
          </div>
        </div>
      }
    >
      <I18nProvider>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <SyncProvider>
                <App />
              </SyncProvider>
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </I18nProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
