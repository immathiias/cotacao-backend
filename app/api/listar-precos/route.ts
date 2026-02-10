import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("precos")
    .select("preco, produtos(nome), fornecedores(nome)");

  return Response.json(data);
}
