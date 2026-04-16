"use client";

import { Navbar } from "@/components/Navbar";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      setStatus("success");
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <header className="bg-white border-b border-slate-100 py-20 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl italic">
            Get in <span className="text-indigo-600">touch</span>
          </h1>
          <p className="mt-6 text-xl text-slate-500 font-medium">
            Have a question or feedback? We&apos;re here to help you get the most out of Convertz.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Why reach out?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Technical Support</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Stuck on a conversion? Our tech team can help you resolve issues with specific file formats.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Feature Requests</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Missing a tool? We prioritize our roadmap based on user feedback. Let us know what to build next.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Bulk & Business</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Need custom enterprise solutions or bulk conversion API access? Contact our sales team.</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 rounded-[32px] bg-slate-900 text-white shadow-xl shadow-slate-200">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Direct Email</p>
              <p className="text-2xl font-black italic">hello@yespstudio.com</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500 font-medium mb-8">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="rounded-2xl border border-slate-200 px-8 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                    <input 
                      required
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-600/10 placeholder:text-slate-300" 
                      placeholder="John Doe" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                    <input 
                      required
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-600/10 placeholder:text-slate-300" 
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Subject</label>
                  <select 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-600/10"
                  >
                    <option>General Inquiry</option>
                    <option>Support Request</option>
                    <option>Business Partnership</option>
                    <option>Reporting a Bug</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Message</label>
                  <textarea 
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5} 
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-600/10 placeholder:text-slate-300" 
                    placeholder="How can we help you today?" 
                  />
                </div>

                {status === "error" && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-2xl gradient-bg py-5 font-bold text-white shadow-lg shadow-indigo-100 transition hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium">Standard response time is within 24 hours.</p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
