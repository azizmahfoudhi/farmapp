import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function SupabaseCheckPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("tree_types").select("*").limit(1);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Supabase check</h1>
      {error ? (
        <pre>Erreur: {error.message}</pre>
      ) : (
        <pre>OK. tree_types rows: {JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

