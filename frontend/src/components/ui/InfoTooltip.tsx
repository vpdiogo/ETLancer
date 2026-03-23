"use client";

import { useState, useRef, useEffect } from "react";
import { Info, X } from "lucide-react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  title: string;
  children: React.ReactNode;
}

export default function InfoTooltip({ title, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.top,
        left: rect.right + 8,
      });
    }
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center ml-1.5 text-gray-400 hover:text-blue-500 transition-colors"
        aria-label={`Info: ${title}`}
      >
        <Info className="h-4 w-4" />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-50 w-96 max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="text-xs text-gray-600 space-y-2 [&_pre]:overflow-x-auto [&_pre]:text-[11px] [&_pre]:whitespace-pre-wrap [&_pre]:break-all">
              {children}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
