"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ResultadoCotacao() {
  const { cotacaoId } = useParams();
  const [dados, setDados] = useState<any>(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("");

  useEffect(() => {
    fetch(`/api/cotacao/resultado?cotacao_id=${cotacaoId}`)
      .then(res => res.json())
      .then(setDados);
  }, [cotacaoId]);

  if (!dados) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">
        📊 Resultado da Cotação
      </h1>

      {/* SELECT FORNECEDOR */}
      <select
        className="bg-zinc-800 p-3 rounded mb-6"
        onChange={e => setFornecedorSelecionado(e.target.value)}
      >
        <option value="">🔎 Ver todos</option>
        {dados.fornecedores.map((f: any) => (
          <option key={f.id} value={f.id}>
            {f.nome}
          </option>
        ))}
      </select>

      {/* LISTA DE PRODUTOS */}
      <div className="space-y-4">
        {dados.produtos.map((p: any) => (
          <div key={p.produto_id} className="bg-zinc-800 p-4 rounded-xl">
            <h2 className="font-semibold mb-2">
              {p.nome}
            </h2>

            {p.precos
              .filter((preco: any) =>
                fornecedorSelecionado
                  ? preco.fornecedor_id == fornecedorSelecionado
                  : true
              )
              .map((preco: any) => (
                <div
                  key={preco.fornecedor_id}
                  className={`flex justify-between ${
                    p.vencedor.fornecedor_id === preco.fornecedor_id
                      ? "text-green-400 font-bold"
                      : ""
                  }`}
                >
                  <span>{preco.fornecedor_nome}</span>
                  <span>R$ {preco.preco.toFixed(2)}</span>
                </div>
              ))}

            <div className="mt-2 text-sm text-green-400">
              🏆 Vencedor: {p.vencedor.fornecedor_nome} — R$
              {p.vencedor.preco.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
