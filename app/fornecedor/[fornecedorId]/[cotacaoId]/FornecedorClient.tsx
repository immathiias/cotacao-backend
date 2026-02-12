"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  fornecedorId: string;
  cotacaoId: string;
}

export default function FornecedorClient({
  fornecedorId,
  cotacaoId,
}: Props) {
  const router = useRouter();

  const [modo, setModo] = useState<"login" | "primeiro" | "sistema">("login");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  const [produtos, setProdutos] = useState<any[]>([]);
  const [precos, setPrecos] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);

  // 🔒 Verifica se já enviou
  useEffect(() => {
    const enviadoAntes = localStorage.getItem(
      `cotacao_enviada_${cotacaoId}_${fornecedorId}`
    );
    if (enviadoAntes) {
      setEnviado(true);
    }
  }, [cotacaoId, fornecedorId]);

  // 🔎 Verifica se é primeiro acesso
  useEffect(() => {
    fetch(`/api/fornecedor/verificar?fornecedor_id=${fornecedorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.primeiro_acesso === true) {
          setModo("primeiro");
        } else {
          setModo("login");
        }
      });
  }, [fornecedorId]);

  // 🔎 Busca produtos
  useEffect(() => {
    fetch(`/api/fornecedor/produtos?cotacao_id=${cotacaoId}`)
      .then((res) => res.json())
      .then((data) => {
        setProdutos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cotacaoId]);

  async function enviar() {
    const payload = {
      fornecedor_id: fornecedorId,
      cotacao_id: cotacaoId,
      precos: produtos.map((p) => ({
        produto_id: p.id,
        preco: precos[p.id] || 0,
      })),
    };

    await fetch("/api/enviar-precos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    localStorage.setItem(
      `cotacao_enviada_${cotacaoId}_${fornecedorId}`,
      "true"
    );

    router.replace("/obrigado");
  }

  // ========================
  // PRIMEIRO ACESSO
  // ========================

  if (modo === "primeiro") {
    return (
      <div className="min-h-screen! flex! items-center! justify-center! bg-zinc-900! text-white!">
        <div className="bg-zinc-800! p-8! rounded-xl! w-96! space-y-4! shadow-lg!">
          <h2 className="text-xl! font-bold!">🔐 Primeiro acesso</h2>

          <input
            type="password"
            placeholder="Nova senha"
            className="w-full! p-2! rounded! bg-zinc-700!"
            onChange={(e) => setSenha(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            className="w-full! p-2! rounded! bg-zinc-700!"
            onChange={(e) => setConfirmaSenha(e.target.value)}
          />

          <button
            className="w-full! bg-green-600! p-2! rounded! hover:bg-green-700!"
            onClick={async () => {
              if (senha !== confirmaSenha)
                return alert("Senhas não coincidem");

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

  // ========================
  // LOGIN
  // ========================

  if (modo === "login") {
    return (
      <div className="min-h-screen! flex! items-center! justify-center! bg-zinc-900! text-white!">
        <div className="bg-zinc-800! p-8! rounded-xl! w-96! space-y-4! shadow-lg!">
          <h2 className="text-xl! font-bold!">🔑 Login</h2>

          <input
            type="password"
            placeholder="Senha"
            className="w-full! p-2! rounded! bg-zinc-700!"
            onChange={(e) => setSenha(e.target.value)}
          />

          <button
            className="w-full! bg-blue-600! p-2! rounded! hover:bg-blue-700!"
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

  // ========================
  // BLOQUEIO
  // ========================

  if (enviado) {
    return (
      <div className="min-h-screen! bg-zinc-900! flex! items-center! justify-center! text-green-500! text-xl! font-semibold!">
        ✅ Cotação já enviada.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen! bg-zinc-900! flex! items-center! justify-center! text-white!">
        Carregando produtos...
      </div>
    );
  }

  // ========================
  // SISTEMA
  // ========================

  return (
    <main className="min-h-screen! bg-zinc-900! text-white! flex! justify-center! p-6!">
      <div className="w-full! max-w-xl!">
        <h1 className="text-4xl! font-bold! mb-6! text-green-600! text-center!">
          SUPERMERCADO SOBRINHO
        </h1>

        <h2 className="text-2xl! font-bold! mb-6! text-center!">
          🛒 Informe seus preços
        </h2>

        {produtos.map((p) => (
          <div
            key={p.id}
            className="mb-4! bg-zinc-800! p-4! rounded-xl! shadow!"
          >
            <label className="block! font-medium! mb-2!">{p.nome}</label>
            <input
              type="number"
              step="0.01"
              placeholder="R$"
              className="w-full bg-zinc-700! rounded-lg! px-4! py-2! outline-none!"
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
          className="w-full! bg-green-600! hover:bg-green-700! transition! py-3! rounded-xl! font-semibold! mt-6!"
        >
          📤 Enviar preços
        </button>
      </div>
    </main>
  );
}
