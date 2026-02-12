import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { nome, produtos, fornecedores } = await req.json();

  const cotacaoId = uuid();

  await supabase.from("cotacoes").insert({
    id: cotacaoId,
    nome
  });

  // salvar produtos
  for (const nomeProduto of produtos) {
    await supabase.from("produtos").insert({
      id: uuid(),
      cotacao_id: cotacaoId,
      nome: nomeProduto,
      ativo: true
    });
  }

  const links = [];

  for (const f of fornecedores) {
    const fornecedorId = uuid();

    await supabase.from("fornecedores").insert({
      id: fornecedorId, // ✅ CORRETO
      nome: f.nome,
      telefone: f.telefone,
      cotacao_id: cotacaoId,
      primeiro_acesso: false, // começa FALSE
      senha: null
    });

    const link = `https://serido-cotacao-backend.vercel.app/fornecedor/${fornecedorId}/${cotacaoId}`;
    links.push({ fornecedor: f.nome, link });

    await enviarWhatsapp(f.telefone, link);
  }

  return Response.json({ cotacaoId, links });
}

async function enviarWhatsapp(telefone: string, link: string) {
  await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telefone,
        type: "text",
        text: {
          body:
            `Olá! 👋\n\n` +
            `A Rede Seridó Sobrinho solicita sua cotação.\n\n` +
            `Acesse o link abaixo e informe apenas os preços:\n\n${link}`
        }
      })
    }
  );
}
