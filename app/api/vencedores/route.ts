import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .rpc("menor_preco_por_produto");

  return Response.json(data);
}
