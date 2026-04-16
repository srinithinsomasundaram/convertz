"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string | string[] | undefined }>;
};

type TokenStatus = "checking" | "valid" | "invalid";

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = use(searchParams);
  const router = useRouter();
  const token = useMemo(() => {
    if (typeof params.token === "string") {
      return params.token;
    }

    if (Array.isArray(params.token)) {
      return params.token[0] ?? "";
    }

    return "";
  }, [params.token]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>(token ? "checking" : "invalid");

  useEffect(() => {
    let cancelled = false;

    const validateToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        return;
      }

      setTokenStatus("checking");

      try {
        const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cancelled) {
            setTokenStatus("invalid");
          }
          return;
        }

        if (!cancelled) {
          setTokenStatus("valid");
        }
      } catch {
        if (!cancelled) {
          setTokenStatus("invalid");
        }
      }
    };

    void validateToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const payload = (await response.json()) as { error?: string; email?: string };

      if (!response.ok) {
        setError(payload.error ?? "Failed to reset password.");
        setIsLoading(false);
        setTokenStatus("invalid");
        return;
      }

      const nextEmail = payload.email ? `&email=${encodeURIComponent(payload.email)}` : "";
      router.push(`/login?reset=success${nextEmail}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="relative w-full max-w-md">
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
              Create a new password
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Choose a new password for your account.
            </p>
          </div>

          {tokenStatus === "checking" ? (
            <div className="rounded-2xl bg-slate-100 p-5 text-center text-sm font-bold text-slate-600">
              Validating your reset link...
            </div>
          ) : tokenStatus === "invalid" ? (
            <div className="space-y-5 text-center">
              <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-600">
                This reset link is invalid or has expired.
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl bg-rose-50 p-4 text-center text-sm font-bold text-rose-600">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="block w-full rounded-2xl border-0 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="Enter at least 8 characters"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="block w-full rounded-2xl border-0 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="Re-enter your new password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-70 transition-all"
              >
                {isLoading ? "Updating..." : "Update password"}
              </button>
            </form>
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `,
        }}
      />
    </div>
  );
}
