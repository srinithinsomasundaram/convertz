import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/newsletter";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const result = await addSubscriber(email);

    if (!result.success) {
      return NextResponse.json(
        { error: "Subscription failed. Please try again later." },
        { status: 500 }
      );
    }

    // Only send welcome email for NEW subscribers to avoid spamming
    if (!result.alreadySubscribed) {
      await sendNewsletterWelcomeEmail(email);
    }

    return NextResponse.json({ 
      success: true, 
      message: result.alreadySubscribed 
        ? "You're already on the list! Welcome back." 
        : "Welcome to our newsletter! Check your inbox for a confirmation." 
    });

  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
