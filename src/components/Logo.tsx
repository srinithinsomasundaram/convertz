import React from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="rounded-2xl bg-slate-950 p-2.5 text-white shadow-sm shadow-slate-900/15">
        <svg
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5.75 8.25h7.5" />
          <path d="m11.75 5.75 5 2.5-5 2.5" />
          <path d="M18.25 15.75h-7.5" />
          <path d="m12.25 13.25-5 2.5 5 2.5" />
        </svg>
      </div>
      <span className="text-2xl font-extrabold tracking-tight text-slate-900">
        Convert<span className="text-indigo-600">z</span>
      </span>
    </div>
  );
}
