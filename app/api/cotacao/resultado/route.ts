import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cotacaoId = searchParams.get("cotacao_id");

  if (!cotacaoId) {
    return NextResponse.json(
      { error: "cotacao_id obrigatório" },
      { status: 400 }
    );
  }

  const { data: precos, error } = await supabase
    .from("precos")
    .select(`
      preco,
      produto:produtos!inner(id, nome),
      fornecedor:fornecedores!inner(id, nome)
    `)
    .eq("cotacao_uuid", cotacaoId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const produtosMap: Record<number, any> = {};

  precos?.forEach((p: any) => {
    const pid = p.produto.id;

    if (!produtosMap[pid]) {
      produtosMap[pid] = {
        produto_id: pid,
        nome: p.produto.nome,
        precos: [],
        vencedor: null
      };
    }

    produtosMap[pid].precos.push({
      fornecedor_id: p.fornecedor.id,
      fornecedor_nome: p.fornecedor.nome,
      preco: p.preco
    });
  });

  // 🏆 calcula vencedor
  Object.values(produtosMap).forEach((produto: any) => {
    produto.vencedor = produto.precos.reduce((menor: any, atual: any) =>
      atual.preco < menor.preco ? atual : menor
    );
  });

  // lista de fornecedores (sem duplicar)
  const fornecedoresMap = new Map<number, { id: number; nome: string }>();

  precos?.forEach((p: any) => {
    fornecedoresMap.set(p.fornecedor.id, {
      id: p.fornecedor.id,
      nome: p.fornecedor.nome
    });
  });

  return NextResponse.json({
    produtos: Object.values(produtosMap),
    fornecedores: Array.from(fornecedoresMap.values())
  });
}
