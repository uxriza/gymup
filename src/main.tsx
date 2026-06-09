import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { AuthProvider } from "@/components/auth-provider";
import { SyncProvider } from "@/components/sync-provider";
import { ToastProvider } from "@/components/ui/toast";
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
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <SyncProvider>
              <App />
            </SyncProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
