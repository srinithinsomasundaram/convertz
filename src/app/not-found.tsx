import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Convertz",
  description: "Oops! We couldn't find the page you're looking for.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-32 text-center lg:px-8">
        <div className="relative">
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 blur-[100px]" />
          <p className="text-base font-black uppercase tracking-widest text-indigo-600">404 Error</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
            Lost in <span className="text-indigo-600 italic">translation?</span>
          </h1>
          <p className="mt-6 text-lg font-medium text-slate-500 max-w-xl mx-auto">
            The page you are looking for has been converted into thin air. Let&apos;s get you back to the tools that matter.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/"
              className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-200 transition hover:bg-indigo-500 active:scale-95"
            >
              Back to Home
            </Link>
            <Link
              href="/faq"
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
            >
              Visit Help Center &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 transition hover:shadow-lg">
            <h3 className="font-bold text-slate-900 mb-2">PDF Tools</h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">Merge, compress, and convert PDF documents.</p>
            <Link href="/" className="text-xs font-bold text-indigo-600 underline">Explore PDF Tools</Link>
          </div>
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 transition hover:shadow-lg">
            <h3 className="font-bold text-slate-900 mb-2">Image Tools</h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">Convert HEIC, JPG, and PNG images.</p>
            <Link href="/" className="text-xs font-bold text-indigo-600 underline">Explore Image Tools</Link>
          </div>
          <div className="rounded-[32px] border border-slate-100 bg-white p-8 transition hover:shadow-lg">
            <h3 className="font-bold text-slate-900 mb-2">Media Conversion</h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">Extract audio and optimize video files.</p>
            <Link href="/" className="text-xs font-bold text-indigo-600 underline">Explore Media Tools</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
