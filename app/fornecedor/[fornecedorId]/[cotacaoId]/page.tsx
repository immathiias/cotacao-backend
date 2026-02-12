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

  const { data, error } = await supabase
    .from("cotacao_fornecedores")
    .select("*")
    .eq("fornecedor_id", fornecedorId)
    .eq("cotacao_id", cotacaoId)
    .maybeSingle(); // ← MELHOR que single()

  if (error || !data) {
    return notFound();
  }

  // ✅ Se encontrou o vínculo correto
  return (
    <FornecedorClient
      fornecedorId={fornecedorId}
      cotacaoId={cotacaoId}
    />
  );
}
