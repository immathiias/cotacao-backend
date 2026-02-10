import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { nome } = await req.json();

  await supabase.from("fornecedores").insert({
    id: uuid(),
    nome,
    ativo: true
  });

  return Response.json({ status: "fornecedor_adicionado" });
}
