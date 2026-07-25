import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ overall_reset_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    console.error("reset overall", error);
    return NextResponse.json(
      { error: "Could not reset overall score." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
