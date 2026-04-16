"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setPreviewUrl(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { error?: string; previewUrl?: string | null };

      if (!response.ok) {
        setError(payload.error ?? "Failed to start password reset.");
        setIsLoading(false);
        return;
      }

      setPreviewUrl(payload.previewUrl ?? null);
      setSuccess(true);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="relative w-full max-w-md">
        {/* Subtle decorative background blob */}
        <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-indigo-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob" />
        <div className="absolute -right-4 -top-8 h-72 w-72 rounded-full bg-emerald-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-pink-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob animation-delay-4000" />
        
        <div className="relative z-10 rounded-[32px] border border-slate-100 bg-white/70 px-8 py-10 shadow-xl backdrop-blur-xl sm:px-12">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex cursor-pointer items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm shadow-indigo-200">
                C
              </div>
              <span className="text-2xl font-extrabold italic tracking-tight text-slate-900">
                Convert<span className="text-indigo-600">z</span>
              </span>
            </Link>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              No worries, we&apos;ll send you reset instructions.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl bg-rose-50 p-4 text-center text-sm font-bold text-rose-600">
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border-0 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>


              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-70 transition-all"
              >
                {isLoading ? "Sending..." : "Reset password"}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-600 mb-6">
                If an account exists for that email, reset instructions are ready.
              </div>
              {/* Removed demo/informational blocks */}
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                  setPreviewUrl(null);
                }}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-500"
              >
                Try another email
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="m15 19-7-7 7-7" />
              </svg>
              Back to log in
            </Link>
          </div>
        </div>
      </div>
      
      {/* Required blob animation standard definition for tailwind.config.ts */}
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}} />
    </div>
  );
}
