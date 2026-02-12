import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const { nome, produtos, fornecedores } = await req.json();

  const cotacaoId = uuid();

  await supabase.from("cotacoes").insert({
    id: cotacaoId,
    nome,
  });

  // salvar produtos
  for (const nomeProduto of produtos) {
    await supabase.from("produtos").insert({
      id: uuid(),
      cotacao_id: cotacaoId,
      nome: nomeProduto,
      ativo: true,
    });
  }

  const links = [];

for (const f of fornecedores) {

  // 1️⃣ Verifica se fornecedor já existe pelo telefone
  let { data: fornecedorExistente } = await supabase
    .from("fornecedores")
    .select("*")
    .eq("telefone", f.telefone)
    .single();

  let fornecedorId;

  if (!fornecedorExistente) {
    // cria fornecedor
    const { data: novoFornecedor } = await supabase
      .from("fornecedores")
      .insert({
        nome: f.nome,
        telefone: f.telefone,
        primeiro_acesso: true,
        senha: null
      })
      .select()
      .single();

    fornecedorId = novoFornecedor.id;
  } else {
    fornecedorId = fornecedorExistente.id;
  }

  // 2️⃣ Cria vínculo na tabela relacional
  await supabase.from("cotacao_fornecedores").insert({
    cotacao_id: cotacaoId,
    fornecedor_id: fornecedorId,
    respondeu: false
  });

  // 3️⃣ Gera link único
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: telefone,
        type: "text",
        text: {
          body:
            `Olá! 👋\n\n` +
            `A Rede Seridó Sobrinho solicita sua cotação.\n\n` +
            `Acesse o link abaixo e informe apenas os preços:\n\n${link}`,
        },
      }),
    },
  );
}
