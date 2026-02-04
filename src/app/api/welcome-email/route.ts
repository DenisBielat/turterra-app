import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const result = await sendWelcomeEmail(
    user.email,
    profile?.display_name || ""
  );

  if (!result.success) {
    console.error("Failed to send welcome email to", user.email);
    // Don't return an error to the client — welcome email failure
    // shouldn't block the onboarding flow
  }

  return NextResponse.json({ success: true });
}
