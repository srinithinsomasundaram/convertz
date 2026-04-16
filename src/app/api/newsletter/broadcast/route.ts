import { NextResponse } from "next/server";
import { getAllSubscribers } from "@/lib/newsletter";
import { sendNewsletterBroadcastEmail } from "@/lib/email";
import { blogPosts } from "@/lib/blogData";

export async function POST(request: Request) {
  try {
    const { slug, secret } = await request.json();

    // Basic security check (ideally this would be admin session check)
    if (secret !== process.env.AUTH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = blogPosts.find(p => p.slug === slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const subscribers = await getAllSubscribers();
    if (subscribers.length === 0) {
      return NextResponse.json({ message: "No subscribers to send to." });
    }

    const result = await sendNewsletterBroadcastEmail(subscribers, {
      title: post.title,
      excerpt: post.excerpt,
      slug: post.slug,
      category: post.category
    });

    if (!result.success) {
      return NextResponse.json({ error: "Broadcast failed" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully broadcasted to ${subscribers.length} subscribers.` 
    });

  } catch (error) {
    console.error("Broadcast API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
