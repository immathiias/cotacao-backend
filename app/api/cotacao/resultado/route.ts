import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // importante usar service role no backend
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const cotacaoId = req.query.cotacao_id as string;

    if (!cotacaoId) {
      return res.status(400).json({ error: "cotacao_id é obrigatório" });
    }

    // =========================
    // BUSCA PREÇOS + RELAÇÕES
    // =========================
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
      return res.status(500).json({ error: error.message });
    }

    // =========================
    // MAPAS DE RESULTADO
    // =========================
    const produtosMap = new Map<string, any>();
    const fornecedoresMap = new Map<string, any>();

    // =========================
    // PROCESSAMENTO
    // =========================
    precos?.forEach((p: any) => {
      const produto = Array.isArray(p.produto) ? p.produto[0] : p.produto;
      const fornecedor = Array.isArray(p.fornecedor)
        ? p.fornecedor[0]
        : p.fornecedor;

      if (!produto || !fornecedor) return;

      // ---------- PRODUTO ----------
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

      // ---------- FORNECEDOR ----------
      if (!fornecedoresMap.has(fornecedor.id)) {
        fornecedoresMap.set(fornecedor.id, {
          id: fornecedor.id,
          nome: fornecedor.nome,
        });
      }
    });

    // =========================
    // RESPOSTA FINAL
    // =========================
    return res.status(200).json({
      produtos: Array.from(produtosMap.values()),
      fornecedores: Array.from(fornecedoresMap.values()),
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}
