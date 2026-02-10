"use client";

import { useEffect, useState } from "react";

export default function FornecedorPage({
  params
}: {
  params: { fornecedorId: string; cotacaoId: string };
}) {
  const { fornecedorId, cotacaoId } = params;

  const [produtos, setProdutos] = useState<any[]>([]);
  const [precos, setPrecos] = useState<Record<string, number>>({});
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetch(`/api/fornecedor/produtos?cotacao_id=${cotacaoId}`)
      .then(res => res.json())
      .then(setProdutos);
  }, [cotacaoId]);

  function enviar() {
    const payload = {
      fornecedor_id: fornecedorId,
      precos: produtos.map(p => ({
        produto_id: p.id,
        preco: precos[p.id] || 0
      }))
    };

    fetch("/api/enviar-precos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(() => setEnviado(true));
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center text-green-600 text-xl">
        ✅ Preços enviados com sucesso!
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        🛒 Informe seus preços
      </h1>

      {produtos.map(p => (
        <div key={p.id} className="mb-3">
          <label className="block font-medium mb-1">
            {p.nome}
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded p-2"
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
        className="w-full bg-green-600 text-white py-3 rounded mt-4"
      >
        📤 Enviar preços
      </button>
    </div>
  );
}
