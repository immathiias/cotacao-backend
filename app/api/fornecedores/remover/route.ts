import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { fornecedor_id } = await req.json();

  const { data } = await supabase
    .from("fornecedores")
    .update({ ativo: false })
    .eq("id", fornecedor_id)
    .select()
    .single();

  await supabase.from("historico").insert({
    id: uuid(),
    tipo: "fornecedor_removido",
    dados: data
  });

  return Response.json({ status: "fornecedor_removido" });
}
