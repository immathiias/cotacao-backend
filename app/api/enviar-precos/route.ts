import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { fornecedor_id, cotacao_id, precos } = body;

    // 🔎 valida dados obrigatórios
    if (!fornecedor_id || !cotacao_id || !precos) {
      return Response.json(
        { error: "Dados incompletos" },
        { status: 400 }
      );
    }

    // 🔐 valida se o fornecedor realmente pertence à cotação
    const { data: vinculo, error: erroVinculo } = await supabase
      .from("cotacao_fornecedores")
      .select("*")
      .eq("fornecedor_id", fornecedor_id)
      .eq("cotacao_id", cotacao_id)
      .single();

    if (erroVinculo || !vinculo) {
      return Response.json(
        { error: "Acesso inválido" },
        { status: 403 }
      );
    }

    // 🚫 impede reenvio se já respondeu
    if (vinculo.respondeu) {
      return Response.json(
        { error: "Cotação já respondida" },
        { status: 400 }
      );
    }

    // 💾 remove preços antigos (caso exista tentativa anterior)
    await supabase
      .from("precos")
      .delete()
      .eq("fornecedor_id", fornecedor_id);

    // 💰 insere novos preços
    for (const item of precos) {
      await supabase.from("precos").insert({
        id: uuid(),
        fornecedor_id,
        cotacao_id,
        produto_id: item.produto_id,
        preco: item.preco
      });
    }

    // ✅ marca como respondido
    await supabase
      .from("cotacao_fornecedores")
      .update({ respondeu: true })
      .eq("fornecedor_id", fornecedor_id)
      .eq("cotacao_id", cotacao_id);

    return Response.json({ status: "ok" });

  } catch (error) {
    console.error("Erro ao enviar preços:", error);

    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
