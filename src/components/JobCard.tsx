import React from "react";

export type JobStatus = "pending" | "processing" | "uploading" | "done" | "failed";

export interface Job {
  id: string;
  name: string;
  toolId: string;
  status: JobStatus;
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: number;
}

export function JobCard({ job, onDownload, onRetry, onDelete }: { 
  job: Job; 
  onDownload: (url: string, name: string) => void;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const getStatusColor = () => {
    switch (job.status) {
      case "done": return "text-emerald-600 bg-emerald-50";
      case "failed": return "text-rose-600 bg-rose-50";
      case "processing": return "text-indigo-600 bg-indigo-50";
      case "uploading": return "text-violet-600 bg-violet-50";
      default: return "text-slate-400 bg-slate-50";
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getStatusColor()}`}>
            {job.status === "done" ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : job.status === "failed" ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-slate-900">{job.name}</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {job.status} • {Math.round(job.progress)}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.status === "done" && job.resultUrl && (
            <button
              onClick={() => onDownload(job.resultUrl!, job.name)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-500 active:scale-95"
            >
              Download
            </button>
          )}
          {job.status === "failed" && (
            <button
              onClick={() => onRetry(job.id)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 active:scale-95"
            >
              Retry
            </button>
          )}
          <button 
            onClick={() => onDelete(job.id)}
            className="rounded-xl p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {(job.status === "processing" || job.status === "uploading") && (
        <div className="mt-4 overflow-hidden rounded-full bg-slate-100 h-1.5">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
