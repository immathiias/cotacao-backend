import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { fornecedor_id, precos } = await req.json();

  for (const item of precos) {
    await supabase.from("precos").insert({
      id: uuid(),
      fornecedor_id,
      produto_id: item.produto_id,
      preco: item.preco
    });
  }

  return Response.json({ status: "ok" });
}
