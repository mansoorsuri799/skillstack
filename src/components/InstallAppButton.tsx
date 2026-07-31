"use client";

import { usePwa } from "@/components/PwaProvider";

export default function InstallAppButton({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { canInstall, isInstalled, isIos, install, iosHintOpen, setIosHintOpen } =
    usePwa();

  if (isInstalled) return null;

  const show = canInstall || isIos;
  if (!show) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => void install()}
        className={
          className ||
          "inline-flex items-center justify-center rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 sm:px-4 sm:py-2 sm:text-sm"
        }
        aria-label="Install SkillStack app"
      >
        {compact ? "Install" : "Install app"}
      </button>

      {iosHintOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
          onClick={() => setIosHintOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-white/10 bg-[#0d1117] p-5 text-left shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="ios-install-title"
              className="font-display text-lg font-semibold text-snow"
            >
              Add SkillStack to your iPhone
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
              <li>
                Tap the <span className="text-snow">Share</span> button in Safari
              </li>
              <li>
                Scroll and tap{" "}
                <span className="text-snow">Add to Home Screen</span>
              </li>
              <li>
                Tap <span className="text-snow">Add</span>
              </li>
            </ol>
            <button
              type="button"
              className="mt-5 w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-[#010409]"
              onClick={() => setIosHintOpen(false)}
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
