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
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <span className="animate-pulse">Carregando cotação...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900 to-black text-white p-8">
      <h1 className="text-3xl font-bold mb-10">
        📊 Resultado da Cotação
      </h1>

      <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
        {dados.produtos.map((p: any) => (
          <div
            key={p.id}
            className="bg-zinc-800/70 backdrop-blur rounded-2xl p-6 border border-zinc-700 shadow-xl hover:shadow-2xl transition"
          >
            {/* HEADER PRODUTO */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold">
                {p.nome}
              </h2>

              <span className="text-green-400 text-lg font-bold">
                R$ {p.menor_preco.toFixed(2)}
              </span>
            </div>

            {/* LISTA DE PREÇOS */}
            <div className="space-y-3">
              {p.precos.map((preco: any) => {
                const vencedor =
                  preco.fornecedor_id === p.vencedor.fornecedor_id;

                return (
                  <div
                    key={preco.fornecedor_id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition
                      ${
                        vencedor
                          ? "bg-green-500/10 border-green-400 text-green-300"
                          : "bg-zinc-900/50 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {preco.fornecedor_nome}
                      </span>

                      {vencedor && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                          🏆 VENCEDOR
                        </span>
                      )}
                    </div>

                    <span className="font-mono">
                      R$ {preco.preco.toFixed(2)}
                    </span>
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
