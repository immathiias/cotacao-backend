import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fornecedor_id = searchParams.get("fornecedor_id");

  const { data } = await supabase
    .from("fornecedores")
    .select("senha")
    .eq("id", fornecedor_id)
    .single();

  return NextResponse.json({ senha: data?.senha || null });
}
