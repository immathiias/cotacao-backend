import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { cotacao_id, nome } = await req.json();

  await supabase.from("produtos").insert({
    id: uuid(),
    cotacao_id,
    nome,
    ativo: true
  });

  return Response.json({ status: "produto_adicionado" });
}
