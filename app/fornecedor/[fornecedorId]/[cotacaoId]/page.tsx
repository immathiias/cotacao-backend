import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import FornecedorClient from "./FornecedorClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
);

export default async function Page({
  params,
}: {
  params: Promise<{ fornecedorId: string; cotacaoId: string }>;
}) {
  const { fornecedorId, cotacaoId } = await params;

  console.log("Fornecedor:", fornecedorId);
  console.log("Cotacao:", cotacaoId);

  const { data, error } = await supabase
    .from("cotacao_fornecedores")
    .select("id")
    .eq("fornecedor_id", fornecedorId)
    .eq("cotacao_id", cotacaoId)
    .maybeSingle();

  if (error) {
    console.error("Erro Supabase:", error);
    return notFound();
  }

  if (!data) {
    return notFound();
  }

  return <FornecedorClient fornecedorId={fornecedorId} cotacaoId={cotacaoId} />;
}
