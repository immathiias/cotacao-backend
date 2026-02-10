import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("historico")
    .select("*")
    .order("criado_em", { ascending: false });

  return Response.json(data);
}
