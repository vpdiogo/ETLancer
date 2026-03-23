"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";

interface InfoTooltipProps {
  title: string;
  children: React.ReactNode;
}

export default function InfoTooltip({ title, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-blue-500 transition-colors"
        aria-label={`Info: ${title}`}
      >
        <Info className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-6 top-0 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
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
            <div className="text-xs text-gray-600 space-y-2">{children}</div>
          </div>
        </>
      )}
    </span>
  );
}
