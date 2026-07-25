import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };
  const id = typeof body.id === "string" ? body.id.trim() : "";

  if (!id) {
    return NextResponse.json({ error: "Meal id is required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("meals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("meal delete", error);
    return NextResponse.json(
      { error: "Could not delete meal." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
