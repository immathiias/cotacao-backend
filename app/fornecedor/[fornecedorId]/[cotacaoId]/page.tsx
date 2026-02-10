"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FornecedorPage() {
  const params = useParams();
  const router = useRouter();

  const fornecedorId = params.fornecedorId as string;
  const cotacaoId = params.cotacaoId as string;

  const [produtos, setProdutos] = useState<any[]>([]);
  const [precos, setPrecos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);

  // 🔒 bloqueio se já enviou
  useEffect(() => {
    const enviadoAntes = localStorage.getItem(
      `cotacao_enviada_${cotacaoId}_${fornecedorId}`
    );
    if (enviadoAntes) {
      setEnviado(true);
    }
  }, [cotacaoId, fornecedorId]);

  useEffect(() => {
    if (!cotacaoId) return;

    fetch(`/api/fornecedor/produtos?cotacao_id=${cotacaoId}`)
      .then(res => res.json())
      .then(data => {
        setProdutos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cotacaoId]);

  function enviar() {
    const payload = {
      fornecedor_id: fornecedorId,
      cotacao_id: cotacaoId,
      precos: produtos.map(p => ({
        produto_id: p.id,
        preco: precos[p.id] || 0
      }))
    };

    fetch("/api/enviar-precos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(() => {
      // 🔒 salva bloqueio
      localStorage.setItem(
        `cotacao_enviada_${cotacaoId}_${fornecedorId}`,
        "true"
      );

      // 📲 monta mensagem WhatsApp
      let mensagem = `📦 *Cotação respondida*%0A%0A`;

      produtos.forEach(p => {
        const valor = precos[p.id] ?? 0;
        mensagem += `• ${p.nome}: R$ ${valor.toFixed(2)}%0A`;
      });

      const telefone = "5599999999999"; // <<< SEU WHATSAPP
      const url = `https://wa.me/${telefone}?text=${mensagem}`;

      // abre WhatsApp
      window.open(url, "_blank");

      // sai da página
      setTimeout(() => {
        router.replace("/obrigado");
      }, 500);
    });
  }

  // 🔒 tela bloqueada
  if (enviado) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-green-500 text-xl font-semibold">
        ✅ Cotação já enviada.<br />Você pode fechar esta página.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">
        Carregando produtos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6 flex justify-center">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🛒 Informe seus preços
        </h1>

        {produtos.map(p => (
          <div
            key={p.id}
            className="mb-4 bg-zinc-800 p-4 rounded-xl"
          >
            <label className="block font-medium mb-2">
              {p.nome}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="R$"
              className="w-full bg-zinc-700 text-white rounded-lg px-4 py-2 outline-none"
              onChange={e =>
                setPrecos({
                  ...precos,
                  [p.id]: Number(e.target.value)
                })
              }
            />
          </div>
        ))}

        <button
          onClick={enviar}
          className="w-full bg-green-600 hover:bg-green-700 transition py-3 rounded-xl font-semibold mt-6"
        >
          📤 Enviar preços via WhatsApp
        </button>
      </div>
    </div>
  );
}
