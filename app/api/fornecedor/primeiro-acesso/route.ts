import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // use service role aqui
);

export async function POST(req: Request) {
  const { fornecedor_id, senha } = await req.json();

  const { error } = await supabase
    .from("fornecedores")
    .update({ senha })
    .eq("id", fornecedor_id)
    .is("senha", null); // só permite se ainda não tiver senha

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
