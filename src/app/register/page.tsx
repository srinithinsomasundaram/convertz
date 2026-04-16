"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Real registration logic
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific errors like "User already exists"
        if (data.error?.includes("already exists")) {
          setError("Account already exists. Please log in instead.");
        } else {
          setError(data.error || "Registration failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // If verification is required, show success message
      if (data.requiresVerification) {
        setIsSuccess(true);
        setIsLoading(false);
        return;
      }

      // Fallback: If no verification required, auto sign-in (legacy behavior)
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res?.error) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/login?registered=true");
      }
    } catch (error) {
      console.error("Fetch error during registration:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
        <div className="relative w-full max-w-md">
          <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-emerald-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob" />
          <div className="absolute -right-4 -top-8 h-72 w-72 rounded-full bg-indigo-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob animation-delay-2000" />
          <div className="relative z-10 rounded-[32px] border border-slate-100 bg-white/70 px-8 py-12 text-center shadow-xl backdrop-blur-xl">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Check your email</h1>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
              We've sent a verification link to <span className="font-bold text-slate-900">{email}</span>. 
              Please click the link in the email to activate your account.
            </p>
            <div className="mt-8 space-y-3">
              <Link href="/login" className="flex w-full items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition-all">
                Return to login
              </Link>
              <button 
                onClick={() => setIsSuccess(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                type="button"
              >
                Entered the wrong email?
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="relative w-full max-w-md">
        {/* Subtle decorative background blob */}
        <div className="absolute -left-4 -top-4 h-72 w-72 rounded-full bg-emerald-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob" />
        <div className="absolute -right-4 -top-8 h-72 w-72 rounded-full bg-indigo-300 mix-blend-multiply opacity-30 blur-2xl filter animate-blob animation-delay-2000" />
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
              Create an account
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Join to unlock unlimited, high-quality conversions
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="rounded-2xl bg-rose-50 p-4 text-center text-sm font-bold text-rose-600">
                {error}
                {error.includes("exists") && (
                  <div className="mt-2">
                    <Link href="/login" className="text-indigo-600 hover:underline">Log in here</Link>
                  </div>
                )}
              </div>
            )}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-2xl border-0 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all"
                placeholder="Jane Doe"
              />
            </div>

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
                className="block w-full rounded-2xl border-0 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border-0 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-600 sm:text-sm transition-all"
                placeholder="Create a strong password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-full bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-70 transition-all"
            >
              {isLoading ? "Creating account..." : "Sign up for Convertz"}
            </button>
          </form>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="bg-white/80 px-4">Or sign up with</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border-2 border-slate-100 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 hover:border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign up with Google
            </button>
          </div>
          
          <p className="mt-8 text-center text-xs font-semibold text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
              Log in here
            </Link>
          </p>
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
