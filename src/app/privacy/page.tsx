import { Navbar } from "@/components/Navbar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Convertz Safety",
  description: "Learn how we protect your privacy and handle your data at Convertz.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <header className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Privacy <span className="text-indigo-600">Policy</span></h1>
          <p className="mt-4 text-slate-500 font-medium">Your data safety is our primary mission.</p>
        </div>
      </header>
      
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="blog-content">
          <h2>1. Information We Collect</h2>
          <p>We believe in minimal data collection. For guest users, we only store conversion metadata on our servers for a short time. For registered users, we collect your email address and profile name as provided by your OAuth provider (e.g., Google).</p>
          
          <h2>2. Local-First Processing</h2>
          <p>The core of Convertz is our local-first engine. When you use tools like PDF Merge or HEIC to JPG, the processing happens entirely within your browser&apos;s memory. The converted result is then uploaded to the cloud so you can download it for a limited time.</p>
          
          <h2>3. Cookies and Storage</h2>
          <p>We use cookies to keep short-lived guest sessions and store conversion metadata in Supabase. Download links and files are stored in Cloudinary and automatically deleted after 30 minutes.</p>
          
          <h2>4. Third-Party Services</h2>
          <p>We use Supabase for authentication and Cloudinary for optional temporary cloud results. Both providers follow industry-standard security protocols.</p>
          
          <h2>5. Your Rights</h2>
          <p>You have the right to delete your account and all associated history at any time through the platform settings.</p>
        </div>
      </main>
    </div>
  );
}
