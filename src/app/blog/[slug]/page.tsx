import { blogPosts } from "@/lib/blogData";
import { notFound } from "next/navigation";
import Link from "next/link";
import { type Metadata } from "next";
import { Navbar } from "@/components/Navbar";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Convertz Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <article className="pb-24">
        {/* Header Section */}
        <header className="bg-slate-50 py-20 border-b border-slate-100">
          <div className="mx-auto max-w-3xl px-6">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 mb-8 transition hover:text-indigo-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-700">
                {post.category}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {post.readTime}
              </span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              {post.title}
            </h1>
            
            <div className="mt-10 flex items-center gap-4 border-t border-slate-200 pt-8">
              <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                {post.author[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{post.author}</p>
                <p className="text-xs font-semibold text-slate-400">{post.date}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div 
          className="mx-auto max-w-3xl px-6 pt-16"
        >
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-20 border-t border-slate-100 pt-16 text-center">
            <div className="rounded-[32px] bg-slate-50 p-10 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Did you find this helpful?</h3>
              <p className="text-slate-500 font-medium mb-6">Share this article with your network.</p>
              <div className="flex items-center justify-center gap-4">
                <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-100 active:scale-95">
                  <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                  Twitter
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-100 active:scale-95">
                  <svg className="h-4 w-4 text-indigo-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </button>
              </div>
            </div>

            <div className="mt-16 flex items-center justify-between">
              <Link 
                href="/blog"
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                &larr; View all articles
              </Link>
              <Link 
                href="/"
                className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 active:scale-95"
              >
                Explore conversion tools &rarr;
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
