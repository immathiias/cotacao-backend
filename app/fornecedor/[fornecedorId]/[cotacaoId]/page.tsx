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

  // 🔐 Validação REAL no banco
  const { data, error } = await supabase
    .from("fornecedores")
    .select("id")
    .eq("id", fornecedorId)
    .eq("cotacao_id", cotacaoId)
    .single();

  if (error || !data) {
    notFound(); // retorna 404 real
  }

  return (
    <FornecedorClient
      fornecedorId={fornecedorId}
      cotacaoId={cotacaoId}
    />
  );
}
