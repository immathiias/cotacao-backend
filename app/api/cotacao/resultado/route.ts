import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type PrecoRow = {
  preco: number;
  produto: {
    id: string;
    nome: string;
    cotacao_id: string;
  }[];
  fornecedor: {
    id: string;
    nome: string;
  }[];
};

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
    produto:produtos!inner(
      id,
      nome,
      cotacao_id
    ),
    fornecedor:fornecedores!inner(
      id,
      nome
    )
  `)
  .eq("produto.cotacao_id", cotacaoId);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const produtosMap: Record<
    string,
    {
      produto_id: string;
      nome: string;
      precos: {
        fornecedor_id: string;
        fornecedor_nome: string;
        preco: number;
      }[];
      vencedor: {
        fornecedor_id: string;
        fornecedor_nome: string;
        preco: number;
      } | null;
    }
  > = {};

  precos.forEach((p: PrecoRow) => {
    const produto = p.produto[0];
    const fornecedor = p.fornecedor[0];

    if (!produto || !fornecedor) return;

    const pid = produto.id;

    if (!produtosMap[pid]) {
      produtosMap[pid] = {
        produto_id: pid,
        nome: produto.nome,
        precos: [],
        vencedor: null
      };
    }

    produtosMap[pid].precos.push({
      fornecedor_id: fornecedor.id,
      fornecedor_nome: fornecedor.nome,
      preco: p.preco
    });
  });

  // 🏆 calcula vencedor por produto
  Object.values(produtosMap).forEach(produto => {
    produto.vencedor = produto.precos.reduce((menor, atual) =>
      atual.preco < menor.preco ? atual : menor
    );
  });

  // fornecedores únicos
  const fornecedoresMap = new Map<string, { id: string; nome: string }>();

  precos.forEach((p: PrecoRow) => {
    const fornecedor = p.fornecedor[0];
    if (!fornecedor) return;

    fornecedoresMap.set(fornecedor.id, {
      id: fornecedor.id,
      nome: fornecedor.nome
    });
  });

  return NextResponse.json({
    produtos: Object.values(produtosMap),
    fornecedores: Array.from(fornecedoresMap.values())
  });
}
