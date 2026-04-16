import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json({ error: "Missing token or email" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  try {
    // 1. Find the token
    const { data: verificationToken, error: tokenError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("identifier", email)
      .eq("token", token)
      .maybeSingle();

    if (tokenError || !verificationToken) {
      return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
    }

    // 2. Check expiry
    if (new Date(verificationToken.expires) < new Date()) {
      // Clean up expired token
      await supabase
        .from("verification_tokens")
        .delete()
        .eq("identifier", email)
        .eq("token", token);
        
      return NextResponse.json({ error: "Verification link has expired" }, { status: 400 });
    }

    // 3. Mark user as verified
    const { data: user, error: userError } = await supabase
      .from("users")
      .update({ emailVerified: new Date().toISOString() })
      .eq("email", email)
      .select()
      .maybeSingle();

    if (userError || !user) {
      console.error("Error verifying user:", userError);
      return NextResponse.json({ error: "Failed to verify user" }, { status: 500 });
    }

    // 4. Delete the token
    await supabase
      .from("verification_tokens")
      .delete()
      .eq("identifier", email)
      .eq("token", token);

    // 5. Send welcome email now
    void sendWelcomeEmail(email, user.name || "");

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
