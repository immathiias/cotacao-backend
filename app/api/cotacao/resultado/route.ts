import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cotacaoId = searchParams.get("cotacao_id");

    if (!cotacaoId) {
      return NextResponse.json(
        { error: "cotacao_id é obrigatório" },
        { status: 400 }
      );
    }

    const { data: precos, error } = await supabase
      .from("precos")
      .select(`
        preco,
        produto:produtos!precos_produto_id_fkey!inner(
          id,
          nome,
          cotacao_id
        ),
        fornecedor:fornecedores!precos_fornecedor_id_fkey!inner(
          id,
          nome
        )
      `)
      .eq("produto.cotacao_id", cotacaoId);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const produtosMap = new Map<string, any>();
    const fornecedoresMap = new Map<string, any>();

    precos?.forEach((p: any) => {
      const produto = Array.isArray(p.produto) ? p.produto[0] : p.produto;
      const fornecedor = Array.isArray(p.fornecedor)
        ? p.fornecedor[0]
        : p.fornecedor;

      if (!produto || !fornecedor) return;

      if (!produtosMap.has(produto.id)) {
        produtosMap.set(produto.id, {
          id: produto.id,
          nome: produto.nome,
          menor_preco: null,
          vencedor: null,
        });
      }

      const prod = produtosMap.get(produto.id);

      if (prod.menor_preco === null || p.preco < prod.menor_preco) {
        prod.menor_preco = p.preco;
        prod.vencedor = {
          fornecedor_id: fornecedor.id,
          fornecedor_nome: fornecedor.nome,
          preco: p.preco,
        };
      }

      if (!fornecedoresMap.has(fornecedor.id)) {
        fornecedoresMap.set(fornecedor.id, {
          id: fornecedor.id,
          nome: fornecedor.nome,
        });
      }
    });

    return NextResponse.json({
      produtos: Array.from(produtosMap.values()),
      fornecedores: Array.from(fornecedoresMap.values()),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}
