"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FornecedorPage() {
  const params = useParams();
  const router = useRouter();

  const fornecedorId = params.fornecedorId as string;
  const cotacaoId = params.cotacaoId as string;

  const [modo, setModo] = useState<"login" | "primeiro" | "sistema">("login");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [produtos, setProdutos] = useState<any[]>([]);
  const [precos, setPrecos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);

  // 🔒 bloqueio se já enviou
  useEffect(() => {
    const enviadoAntes = localStorage.getItem(
      `cotacao_enviada_${cotacaoId}_${fornecedorId}`,
    );
    if (enviadoAntes) {
      setEnviado(true);
    }
  }, [cotacaoId, fornecedorId]);

  useEffect(() => {
    if (!cotacaoId) return;

    fetch(`/api/fornecedor/produtos?cotacao_id=${cotacaoId}`)
      .then((res) => res.json())
      .then((data) => {
        setProdutos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cotacaoId]);

  function enviar() {
    const payload = {
      fornecedor_id: fornecedorId,
      cotacao_id: cotacaoId,
      precos: produtos.map((p) => ({
        produto_id: p.id,
        preco: precos[p.id] || 0,
      })),
    };

    fetch("/api/enviar-precos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      // 🔒 salva bloqueio
      localStorage.setItem(
        `cotacao_enviada_${cotacaoId}_${fornecedorId}`,
        "true",
      );

      // 📲 monta mensagem WhatsApp
      let mensagem = `📦 *Cotação respondida*%0A%0A`;

      produtos.forEach((p) => {
        const valor = precos[p.id] ?? 0;
        mensagem += `• ${p.nome}: R$ ${valor.toFixed(2)}%0A`;
      });

      const telefone = "5584981086835"; // <<< SEU WHATSAPP
      const url = `https://wa.me/${telefone}?text=${mensagem}`;

      // abre WhatsApp
      window.open(url, "_blank");

      // sai da página
      setTimeout(() => {
        router.replace("/obrigado");
      }, 500);
    });
  }

  if (modo === "primeiro") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="bg-zinc-800 p-8 rounded-xl w-96 space-y-4">
          <h2 className="text-xl font-bold">🔐 Primeiro acesso</h2>

          <input
            type="password"
            placeholder="Nova senha"
            className="w-full p-2 rounded bg-zinc-700"
            onChange={(e) => setSenha(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            className="w-full p-2 rounded bg-zinc-700"
            onChange={(e) => setConfirmaSenha(e.target.value)}
          />

          <button
            className="w-full bg-green-600 p-2 rounded"
            onClick={async () => {
              if (senha !== confirmaSenha) return alert("Senhas não coincidem");

              await fetch("/api/fornecedor/primeiro-acesso", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fornecedor_id: fornecedorId,
                  senha,
                }),
              });

              setModo("sistema");
            }}
          >
            Salvar senha
          </button>
        </div>
      </div>
    );
  }

  if (modo === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <div className="bg-zinc-800 p-8 rounded-xl w-96 space-y-4">
          <h2 className="text-xl font-bold">🔑 Login</h2>

          <input
            type="password"
            placeholder="Senha"
            className="w-full p-2 rounded bg-zinc-700"
            onChange={(e) => setSenha(e.target.value)}
          />

          <button
            className="w-full bg-blue-600 p-2 rounded"
            onClick={async () => {
              const res = await fetch("/api/fornecedor/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fornecedor_id: fornecedorId,
                  senha,
                }),
              });

              if (res.ok) setModo("sistema");
              else alert("Senha incorreta");
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // 🔒 tela bloqueada
  if (enviado) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-green-500 text-xl font-semibold">
        ✅ Cotação já enviada.
        <br />
        Você pode fechar esta página.
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
    <main className="min-h-screen flex w-full">
      <div className="bg-zinc-900 text-white w-full gap-6 p-6 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <h1 className="text-4xl! font-bold! mb-6! text-green-600 text-center">
            SUPERMERCADO SOBRINHO
          </h1>
          <h1 className="text-2xl! font-bold! mb-6! text-center">
            🛒 Informe seus preços
          </h1>

          {produtos.map((p) => (
            <div
              key={p.id}
              className="mb-4! gap-7! bg-zinc-800! p-4! rounded-xl!"
            >
              <label className="block! font-medium! mb-2!">{p.nome}</label>
              <input
                type="number"
                step="0.01"
                placeholder="R$"
                className="w-full! bg-zinc-700! text-white! rounded-lg! px-4! py-2! outline-none!"
                onChange={(e) =>
                  setPrecos({
                    ...precos,
                    [p.id]: Number(e.target.value),
                  })
                }
              />
            </div>
          ))}

          <button
            onClick={enviar}
            className="w-full! bg-green-600! hover:bg-green-700! transition py-3! rounded-xl! font-semibold! mt-6!"
          >
            📤 Enviar preços via WhatsApp
          </button>
        </div>
      </div>
    </main>
  );
}
