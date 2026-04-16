import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Check if user exists
    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: "If an account exists for that email, reset instructions have been prepared.",
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in verification_tokens table
    const { error: tokenError } = await supabase
      .from("verification_tokens")
      .upsert({
        identifier: user.email,
        token: token,
        expires: expires.toISOString(),
      }, { onConflict: "identifier,token" });

    if (tokenError) {
      console.error("Error storing reset token:", tokenError);
      return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
    }

    // Send email
    const { success: emailSuccess, error: emailError } = await sendPasswordResetEmail(user.email, token);

    if (!emailSuccess) {
      console.error("Error sending reset email:", emailError);
      // In development, we might still want to show the previewUrl if email fails
      const previewUrl = process.env.NODE_ENV === "development" 
        ? `/reset-password?token=${encodeURIComponent(token)}` 
        : null;

      return NextResponse.json({
        success: true,
        message: "Password reset request processed.",
        previewUrl, // Help debugging if mail not sent in dev
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists for that email, reset instructions have been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
