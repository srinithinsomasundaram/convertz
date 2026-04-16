"use client";

import { blogPosts } from "@/lib/blogData";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

export default function BlogListing() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Subscription failed");

      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <header className="bg-white border-b border-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Insights & <span className="text-indigo-600">Guides</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 font-medium">
              Everything you need to know about secure file conversion, productivity hacks, and modern web tech.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article 
              key={post.slug}
              className="group flex flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm transition hover:shadow-xl hover:border-indigo-100"
            >
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                    {post.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {post.readTime}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold leading-snug text-slate-900 group-hover:text-indigo-600 transition">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                
                <p className="mt-4 text-slate-500 text-sm font-medium leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">{post.author}</span>
                    <span className="text-[10px] font-medium text-slate-400">{post.date}</span>
                  </div>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition group-hover:bg-indigo-600 group-hover:text-white"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <div className="mx-auto max-w-7xl px-6 pb-24 lg:px-12">
        <div className="rounded-[40px] gradient-bg p-12 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <h2 className="text-3xl font-bold mb-4">Never miss an update</h2>
          <p className="text-indigo-100 font-medium mb-8 max-w-xl mx-auto">
            Get the latest guides and feature announcements delivered straight to your inbox.
          </p>
          
          {status === "success" ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white mb-4">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-xl font-bold">{message}</p>
              <button 
                onClick={() => setStatus("idle")}
                className="mt-6 text-sm font-bold text-white underline underline-offset-4 opacity-80 hover:opacity-100"
              >
                Use another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" 
                className="flex-1 rounded-2xl border-none bg-white/10 px-6 py-4 text-white placeholder:text-indigo-200 outline-none ring-1 ring-white/20 focus:ring-white/40 transition"
              />
              <button 
                type="submit"
                disabled={status === "loading"}
                className="rounded-2xl bg-white px-8 py-4 font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>
          )}
          
          {status === "error" && (
            <p className="mt-4 text-sm font-bold text-rose-200 animate-in fade-in slide-in-from-top-1">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
