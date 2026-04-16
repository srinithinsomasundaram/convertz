import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "Reset token is missing." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  // Validate token
  const { data: tokenRecord, error } = await supabase
    .from("verification_tokens")
    .select("identifier, expires")
    .eq("token", token)
    .maybeSingle();

  if (error || !tokenRecord) {
    return NextResponse.json({ valid: false, error: "This reset link is invalid or expired." }, { status: 400 });
  }

  const isExpired = new Date(tokenRecord.expires) < new Date();
  if (isExpired) {
    return NextResponse.json({ valid: false, error: "This reset link has expired." }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    email: tokenRecord.identifier,
  });
}

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();

    // 1. Verify token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("verification_tokens")
      .select("identifier, expires")
      .eq("token", token)
      .maybeSingle();

    if (tokenError || !tokenRecord || new Date(tokenRecord.expires) < new Date()) {
      return NextResponse.json(
        { error: "This reset link is invalid or expired." },
        { status: 400 },
      );
    }

    // 2. Update user password
    const hashedPassword = await bcrypt.hash(password, 12);
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("email", tokenRecord.identifier);

    if (updateError) {
      console.error("Error updating password:", updateError);
      return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
    }

    // 3. Delete the spent token
    await supabase
      .from("verification_tokens")
      .delete()
      .eq("token", token);

    return NextResponse.json({
      success: true,
      email: tokenRecord.identifier,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
