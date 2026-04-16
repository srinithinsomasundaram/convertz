"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Please check your email.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}&email=${email}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully! You can now log in.");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The link may have expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    verifyEmail();
  }, [token, email, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="relative w-full max-w-md">
        {/* Subtle decorative background blob */}
        <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-emerald-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob" />
        <div className="absolute -right-4 -top-8 h-72 w-72 rounded-full bg-indigo-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob animation-delay-2000" />
        
        <div className="relative z-10 rounded-[32px] border border-slate-100 bg-white/70 px-8 py-12 text-center shadow-xl backdrop-blur-xl">
          <Link href="/" className="mb-8 inline-flex cursor-pointer items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm shadow-indigo-200">
              C
            </div>
            <span className="text-2xl font-extrabold italic tracking-tight text-slate-900">
              Convert<span className="text-indigo-600">z</span>
            </span>
          </Link>

          {status === "loading" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              </div>
              <h1 className="text-xl font-bold text-slate-900">Verifying your email...</h1>
              <p className="text-sm font-medium text-slate-500">Please wait while we confirm your account.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Verified!</h1>
              <p className="text-sm font-medium text-emerald-600">{message}</p>
              <div className="pt-4">
                 <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition-all">
                  Sign In Now
                 </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Error</h1>
              <p className="text-sm font-medium text-rose-600">{message}</p>
              <div className="pt-4">
                 <Link href="/register" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 underline">
                  Back to Registration
                 </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
