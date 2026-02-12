import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const { nome, produtos, fornecedores } = await req.json();

    const cotacaoId = uuid();

    // cria cotação
    const { error: erroCotacao } = await supabase
      .from("cotacoes")
      .insert({
        id: cotacaoId,
        nome
      });

    if (erroCotacao) {
      return Response.json({ error: erroCotacao.message }, { status: 500 });
    }

    // cria produtos
    for (const nomeProduto of produtos) {
      const { error } = await supabase.from("produtos").insert({
        id: uuid(),
        cotacao_id: cotacaoId,
        nome: nomeProduto,
        ativo: true
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    const links = [];

    for (const f of fornecedores) {

      const fornecedorId = uuid();

      // cria fornecedor
      const { error: erroFornecedor } = await supabase
        .from("fornecedores")
        .insert({
          id: fornecedorId,
          nome: f.nome,
          telefone: f.telefone,
          primeiro_acesso: false,
          senha: null
        });

      if (erroFornecedor) {
        return Response.json({ error: erroFornecedor.message }, { status: 500 });
      }

      // cria relação fornecedor <-> cotação
      const { error: erroRelacao } = await supabase
        .from("cotacao_fornecedores")
        .insert({
          id: uuid(),
          fornecedor_id: fornecedorId,
          cotacao_id: cotacaoId
        });

      if (erroRelacao) {
        return Response.json({ error: erroRelacao.message }, { status: 500 });
      }

      const link = `https://serido-cotacao-backend.vercel.app/fornecedor/${fornecedorId}/${cotacaoId}`;
      links.push({ fornecedor: f.nome, link });

      await enviarWhatsapp(f.telefone, link);
    }

    return Response.json({ success: true, cotacaoId, links });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function enviarWhatsapp(telefone: string, link: string) {
  await fetch(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
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
