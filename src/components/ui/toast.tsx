import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "destructive";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastIcon = {
  default: Info,
  success: CheckCircle2,
  destructive: XCircle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const nextToast: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? "success",
    };

    setToasts((current) => [...current.slice(-2), nextToast]);
    window.setTimeout(() => removeToast(id), 2800);
  }, [removeToast]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[90] px-4">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-2">
          {toasts.map((item) => {
            const Icon = toastIcon[item.variant];

            return (
              <div
                key={item.id}
                role="status"
                aria-live="polite"
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-md border bg-card/95 p-3 text-card-foreground shadow-[0_18px_48px_rgb(0_0_0/0.32)] backdrop-blur-md animate-page-transition",
                  item.variant === "success" && "border-primary/35",
                  item.variant === "default" && "border-border",
                  item.variant === "destructive" && "border-destructive/45",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                    item.variant === "success" && "bg-primary/15 text-primary",
                    item.variant === "default" && "bg-secondary text-muted-foreground",
                    item.variant === "destructive" && "bg-destructive/15 text-destructive",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5">{item.title}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Tutup notifikasi"
                  onClick={() => removeToast(item.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
