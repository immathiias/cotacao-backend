import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { fornecedor_id, senha } = await req.json();

  const { error } = await supabase
    .from("fornecedores")
    .update({
      senha,
      primeiro_acesso: false
    })
    .eq("id", fornecedor_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
