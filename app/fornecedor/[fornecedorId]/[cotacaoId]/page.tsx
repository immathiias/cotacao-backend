import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import FornecedorClient from "./FornecedorClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

interface Props {
  params: {
    fornecedorId: string;
    cotacaoId: string;
  };
}

export default async function Page({ params }: Props) {
  const { fornecedorId, cotacaoId } = params;

  // 🔎 Busca fornecedor
  const { data, error } = await supabase
    .from("fornecedores")
    .select("id, cotacao_id")
    .eq("id", fornecedorId)
    .limit(1);

  // ❌ Se deu erro ou não encontrou
  if (error || !data || data.length === 0) {
    return notFound();
  }

  const fornecedor = data[0];

  // ❌ Se cotação não corresponde
  if (fornecedor.cotacao_id !== cotacaoId) {
    return notFound();
  }

  // ✅ Tudo certo
  return (
    <FornecedorClient
      fornecedorId={fornecedorId}
      cotacaoId={cotacaoId}
    />
  );
}
