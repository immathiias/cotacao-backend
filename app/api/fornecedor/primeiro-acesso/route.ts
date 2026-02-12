import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export async function POST(req: Request) {
  const { fornecedor_id, senha } = await req.json();

  if (!fornecedor_id || !senha) {
    return NextResponse.json(
      { error: "Dados inválidos" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("fornecedores")
    .update({
      senha: senha,
      primeiro_acesso: true,
    })
    .eq("id", fornecedor_id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
