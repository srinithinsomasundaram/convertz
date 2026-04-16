"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { getGuestConversionsRemaining } from "@/lib/conversionLimits";

export function Navbar({
  onOpenHistory,
  historyCount = 0,
}: {
  onOpenHistory?: () => void;
  historyCount?: number;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const isAuthenticated = Boolean(session?.user?.id);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-[60] border-b px-6 py-4 glass transition-all duration-300 ${
        isScrolled ? "border-slate-200 shadow-md bg-white/80" : "border-slate-100"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {onOpenHistory && (
                <button
                  onClick={onOpenHistory}
                  className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                  History
                </button>
              )}

              <div className="hidden sm:flex items-center gap-2">
                <div className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Unlimited
                </div>
                <Link
                  href="/blog"
                  className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Blog
                </Link>
                <Link
                  href="/faq"
                  className="hidden md:flex rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  FAQ
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-indigo-100 shadow-sm"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 border-2 border-indigo-50">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <button
                  onClick={() => signOut()}
                  className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex sm:hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {onOpenHistory && (
                <button
                  onClick={onOpenHistory}
                  className="hidden sm:flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                  History
                </button>
              )}
              <div className="hidden sm:block rounded-full bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-amber-700">
                {getGuestConversionsRemaining(historyCount)} Free Left
              </div>
              <button
                onClick={() => signIn()}
                className="rounded-full bg-indigo-600 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition active:scale-95"
              >
                Sign In
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/blog"
                  className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Blog
                </Link>
                <Link
                  href="/faq"
                  className="hidden md:flex rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  FAQ
                </Link>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex sm:hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-x-0 top-[73px] z-50 border-b border-slate-100 bg-white p-6 shadow-xl sm:hidden animate-in slide-in-from-top duration-300">
          <div className="grid gap-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl p-4 text-sm font-bold text-slate-900 bg-slate-50"
            >
              Home
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl p-4 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Blog & Guides
            </Link>
            <Link
              href="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl p-4 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
            >
              FAQ
            </Link>
            {onOpenHistory && (
              <button
                onClick={() => {
                  onOpenHistory();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 rounded-2xl p-4 text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Conversion History
              </button>
            )}
            {session && (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 rounded-2xl p-4 text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
