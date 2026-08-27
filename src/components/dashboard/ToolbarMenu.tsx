"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { inputClass } from "@/components/dashboard/ui";

type MenuOption = {
  value: string;
  label: string;
  description?: string;
  example?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

export function ToolbarMenu({
  value,
  onChange,
  options,
  disabled,
  className = "",
  minWidth = "9.5rem",
  menuMinWidth,
  searchable = false,
  searchPlaceholder = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  options: MenuOption[];
  disabled?: boolean;
  className?: string;
  minWidth?: string;
  /** Dropdown panel width — defaults to trigger width, use a larger value for rich menus. */
  menuMinWidth?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value);
  const filtered =
    searchable && query.trim()
      ? options.filter((option) =>
          option.label.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : options;
  const hasRichOptions = options.some(
    (option) => option.description || option.example,
  );

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const menuPanel =
    open && menuPosition ? (
      <div
        ref={menuRef}
        id={listId}
        role="listbox"
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          width: menuPosition.width,
          minWidth: menuMinWidth ?? (hasRichOptions ? "17.5rem" : minWidth),
          zIndex: 120,
        }}
        className="max-h-80 overflow-hidden rounded-xl border border-line bg-bg-elevated shadow-2xl"
      >
        {searchable ? (
          <div className="border-b border-line p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                className={`${inputClass} pl-9`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
              />
            </div>
          </div>
        ) : null}

        <div className="max-h-64 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-sm text-ink-muted">No matches found.</p>
          ) : (
            filtered.map((option) => {
              const isSelected = option.value === value;
              const rich = Boolean(option.description || option.example);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full rounded-lg px-3 py-2.5 text-left transition ${
                    isSelected ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                  }`}
                >
                  {rich ? (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-snow">
                          {option.label}
                        </span>
                        {isSelected ? (
                          <Check className="h-4 w-4 shrink-0 text-accent" />
                        ) : null}
                      </div>
                      {option.description ? (
                        <p className="mt-0.5 text-xs text-ink-muted">
                          {option.description}
                        </p>
                      ) : null}
                      {option.example ? (
                        <p className="mt-1 font-mono text-[11px] text-ink-muted/80">
                          {option.example}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <span className="flex w-full items-center gap-2 text-sm text-snow">
                      {isSelected ? (
                        <Check className="h-4 w-4 shrink-0 text-accent" />
                      ) : (
                        <span className="h-4 w-4 shrink-0" />
                      )}
                      {option.label}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    ) : null;

  return (
    <div
      ref={rootRef}
      className={`relative shrink-0 ${className}`}
      style={{ minWidth }}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-bg px-3 py-2.5 text-left text-sm text-snow transition hover:border-accent/30 disabled:cursor-not-allowed disabled:opacity-70 ${open ? "border-accent/40 ring-1 ring-accent/20" : ""}`}
      >
        <span className="truncate">{selected?.label ?? value}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {typeof document !== "undefined" && menuPanel
        ? createPortal(menuPanel, document.body)
        : null}
    </div>
  );
}
