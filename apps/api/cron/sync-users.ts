import { getDb } from "../_utils/db";
import { users as neonUsers } from "../../../packages/db/schema";
import { createClient, User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";

export const config = { runtime: "nodejs" };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function handler(req: Request): Promise<Response> {
  // Simple token check (Vercel Cron header or ?token=)
  const token = new URL(req.url).searchParams.get("token");
  if (token !== process.env.CRON_SYNC_TOKEN) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;

    const db = getDb();
    const upserts = (data.users as User[]).map(async (u) => {
      const display = (u.user_metadata as any)?.display_name ?? null;
      await db
        .insert(neonUsers)
        .values({ id: u.id, email: u.email ?? "", displayName: display })
        .onConflictDoUpdate({
          target: neonUsers.id,
          set: { email: u.email ?? "", displayName: display },
        });
    });
    await Promise.all(upserts);
    return new Response(`Synced ${data.users.length} users`, { status: 200 });
  } catch (e) {
    console.error("sync error", e);
    return new Response("Sync failed", { status: 500 });
  }
} 