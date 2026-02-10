"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ResultadoCotacao() {
  const { cotacaoId } = useParams();
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/cotacao/resultado?cotacao_id=${cotacaoId}`)
      .then(res => res.json())
      .then(setDados);
  }, [cotacaoId]);

  if (!dados) {
    return <div className="p-6 text-white">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">
        📊 Resultado da Cotação
      </h1>

      <div className="space-y-6">
        {dados.produtos.map((p: any) => (
          <div
            key={p.id}
            className="bg-zinc-800 p-4 rounded-xl border border-zinc-700"
          >
            <h2 className="font-semibold text-lg mb-3">
              {p.nome}
            </h2>

            <div className="space-y-1">
              {p.precos.map((preco: any) => {
                const vencedor =
                  preco.fornecedor_id === p.vencedor.fornecedor_id;

                return (
                  <div
                    key={preco.fornecedor_id}
                    className={`flex justify-between ${
                      vencedor ? "text-green-400 font-bold" : "text-zinc-300"
                    }`}
                  >
                    <span>
                      {preco.fornecedor_nome}
                      {vencedor && " — 🏆 VENCEDOR"}
                    </span>

                    <span>R$ {preco.preco.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
