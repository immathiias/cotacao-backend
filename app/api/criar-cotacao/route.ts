import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { nome, produtos, fornecedores } = await req.json();

  const cotacaoId = uuid();
  await supabase.from("cotacoes").insert({ id: cotacaoId, nome });

  for (const p of produtos) {
    await supabase.from("produtos").insert({
      id: uuid(),
      cotacao_id: cotacaoId,
      nome: p
    });
  }

  const links = [];

  for (const f of fornecedores) {
    const fornecedorId = uuid();
    await supabase.from("fornecedores").insert({
      id: fornecedorId,
      nome: f
    });

    links.push({
      fornecedor: f,
      link: `https://seusite.vercel.app/fornecedor/${fornecedorId}`
    });
  }

  return Response.json({ cotacaoId, links });
}
