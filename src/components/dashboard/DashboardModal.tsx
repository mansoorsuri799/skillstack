"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function DashboardModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthClass =
    size === "xl"
      ? "max-w-4xl"
      : size === "lg"
        ? "max-w-2xl"
        : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-modal-title"
        className={`relative flex max-h-[90vh] w-full ${widthClass} flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
          <div>
            <h2 id="dashboard-modal-title" className="font-display text-lg font-semibold text-snow">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-ink-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line p-2 text-ink-muted transition hover:border-accent/30 hover:text-snow"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>
        {footer ? (
          <div className="border-t border-line bg-bg/60 px-5 py-4 md:px-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
