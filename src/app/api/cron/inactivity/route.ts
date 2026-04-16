import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { sendInactivityEmail } from "@/lib/email";

// This route can be called by a CRON service (like Vercel Cron or GitHub Actions)
// Example: curl -X GET http://localhost:3000/api/cron/inactivity?secret=YOUR_SECRET
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Optional: Verify secret to prevent unauthorized triggers
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    
    // Calculate timestamp for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    // 1. Fetch users who haven't logged in for 7 days AND haven't been notified yet
    const { data: inactiveUsers, error: fetchError } = await supabase
      .from("users")
      .select("id, name, email")
      .lt("last_login_at", sevenDaysAgoStr)
      .eq("inactivity_notified", false);

    if (fetchError) throw fetchError;

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return NextResponse.json({ message: "No inactive users to notify" });
    }

    console.log(`Found ${inactiveUsers.length} inactive users. Sending emails...`);

    // 2. Send emails and track IDs for batch update
    const notifiedIds: string[] = [];
    
    for (const user of inactiveUsers) {
      if (!user.email) continue;
      
      const { success } = await sendInactivityEmail(user.email, user.name || undefined);
      if (success) {
        notifiedIds.push(user.id);
      }
    }

    // 3. Update database to prevent duplicate emails
    if (notifiedIds.length > 0) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ inactivity_notified: true })
        .in("id", notifiedIds);

      if (updateError) throw updateError;
    }

    return NextResponse.json({
      message: "Inactivity check completed",
      processedCount: inactiveUsers.length,
      notifiedCount: notifiedIds.length,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
