import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cotacao_id = searchParams.get("cotacao_id");

  const { data } = await supabase
    .from("produtos")
    .select("id,nome")
    .eq("cotacao_id", cotacao_id)
    .eq("ativo", true);

  return Response.json(data);
}
