import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { fornecedor_id, senha } = await req.json();

  const { data, error } = await supabase
    .from("fornecedores")
    .select("senha")
    .eq("id", fornecedor_id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
  }

  if (!data.senha) {
    return NextResponse.json({ error: "Primeiro acesso necessário" }, { status: 401 });
  }

  if (data.senha !== senha) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
