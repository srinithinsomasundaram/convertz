import { type Metadata } from "next";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Convertz Support",
  description: "Find answers to common questions about file security, conversion limits, and supported formats on Convertz.",
};

const faqs = [
  {
    q: "How secure are my files?",
    a: "Extremely secure. Unlike traditional converters, Convertz processes most files locally in your browser. This means your data never leaves your computer, ensuring 100% privacy for sensitive documents."
  },
  {
    q: "Is there a file size limit?",
    a: "For local conversions, the limit is based on your device's available memory (RAM). Typically, files up to 500MB process smoothly. For cloud-enhanced tools, the limit is 100MB per file."
  },
  {
    q: "Do I need to create an account?",
    a: "No. Guest users can make up to 3 free conversions without an account. Signing in unlocks unlimited conversions and keeps your recent conversion history available for 30 minutes."
  },
  {
    q: "Which formats do you support?",
    a: "We support over 20+ combinations including PDF, Word (DOCX), Excel (XLSX), JPG, PNG, HEIC, MP4, and MP3. We are constantly adding more based on user feedback."
  },
  {
    q: "What happens to my files after 30 minutes?",
    a: "To protect your privacy, we have a strict 30-minute auto-purge policy. Any local metadata or cloud-cached files are permanently deleted after 30 minutes of inactivity."
  },
  {
    q: "Is Convertz free to use?",
    a: "Yes. You can use Convertz for free as a guest for up to 3 conversions, and signed-in users get unlimited conversions on the current plan."
  }
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="bg-white border-b border-slate-100 py-20 pb-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            How can we <span className="text-indigo-600">help?</span>
          </h1>
          <p className="mt-6 text-xl text-slate-500 font-medium">
            Search our frequently asked questions for instant answers.
          </p>
          <div className="mt-10 max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search for answers..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-[20px] py-5 pl-14 pr-6 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition shadow-sm"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 -mt-12 pb-24">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="group rounded-[28px] border border-slate-100 bg-white p-8 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-sm font-black">
                  Q
                </span>
                {faq.q}
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium pl-12">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[40px] bg-indigo-600 p-12 text-center text-white shadow-2xl shadow-indigo-200">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-indigo-100 font-medium mb-8">
            Can&apos;t find what you&apos;re looking for? Our team is ready to assist you.
          </p>
          <a
            href="mailto:hello@yespstudio.com"
            className="inline-flex rounded-2xl bg-white px-8 py-4 font-bold text-indigo-600 shadow-lg transition hover:bg-indigo-50 active:scale-95"
          >
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}
