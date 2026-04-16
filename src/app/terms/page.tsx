import { Navbar } from "@/components/Navbar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Convertz",
  description: "Read our terms of service and usage conditions.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <header className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Terms of <span className="text-indigo-600">Service</span></h1>
          <p className="mt-4 text-slate-500 font-medium">Last updated: April 11, 2026</p>
        </div>
      </header>
      
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="blog-content">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Convertz, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          
          <h2>2. Description of Service</h2>
          <p>Convertz provides web-based file conversion tools. Our unique local-first technology processes files in your browser whenever possible to prioritize your privacy.</p>
          
          <h2>3. User Conduct</h2>
          <p>You agree not to use Convertz for any illegal purposes or to upload malware, virus-infected files, or any content that violates third-party intellectual property rights.</p>
          
          <h2>4. Data Retention & Privacy</h2>
          <p>We respect your privacy. Any files processed through our local tools never leave your device. For cloud-processed files, we follow a strict 30-minute auto-purge policy.</p>
          
          <h2>5. Limitation of Liability</h2>
          <p>Convertz is provided &quot;as is&quot; without any warranties. We are not liable for any data loss or damages resulting from the use of our conversion tools.</p>
        </div>
      </main>
    </div>
  );
}
