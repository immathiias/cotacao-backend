import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { fornecedor_id, senha } = await req.json();

  const { data } = await supabase
    .from("fornecedores")
    .select("*")
    .eq("id", fornecedor_id)
    .single();

  if (!data || data.senha !== senha) {
    return NextResponse.json(
      { error: "Senha incorreta" },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
