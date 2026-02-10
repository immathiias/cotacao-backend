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
    return <div className="p-6 text-white">Carregando...</div>;
  }

  const produtosFiltrados = fornecedorSelecionado
    ? dados.produtos.filter(
        (p: any) => p.vencedor.fornecedor_id === fornecedorSelecionado
      )
    : dados.produtos;

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">
        📊 Resultado da Cotação
      </h1>

      {/* SELECT FORNECEDOR */}
      <select
        className="bg-zinc-800 p-3 rounded mb-6"
        value={fornecedorSelecionado}
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
        {produtosFiltrados.map((p: any) => (
          <div
            key={p.id}
            className="bg-zinc-800 p-4 rounded-xl border border-zinc-700"
          >
            <h2 className="font-semibold text-lg mb-2">
              {p.nome}
            </h2>

            <div className="flex justify-between items-center">
              <span className="text-green-400 font-bold">
                🏆 {p.vencedor.fornecedor_nome}
              </span>

              <span className="text-xl text-green-400 font-bold">
                R$ {p.menor_preco.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
