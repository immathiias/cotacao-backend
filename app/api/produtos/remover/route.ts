import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { produto_id } = await req.json();

  const { data } = await supabase
    .from("produtos")
    .update({ ativo: false })
    .eq("id", produto_id)
    .select()
    .single();

  await supabase.from("historico").insert({
    id: uuid(),
    tipo: "produto_removido",
    dados: data
  });

  return Response.json({ status: "produto_removido" });
}
