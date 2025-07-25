import { getDb } from "../_utils/db";
import { legacyVault } from "../../../packages/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: "nodejs" };

// 服务端 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration for server-side operations');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const url = new URL(request.url);
    const vaultId = url.searchParams.get('vaultId');
    const userId = url.searchParams.get('userId');

    if (!vaultId || !userId) {
      return new Response("Missing vaultId or userId parameter", { status: 400 });
    }

    // 验证用户权限
    const db = getDb();
    const vaultItem = await db
      .select()
      .from(legacyVault)
      .where(eq(legacyVault.id, vaultId))
      .limit(1);

    if (!vaultItem.length || vaultItem[0].userId !== userId) {
      return new Response("Vault item not found or access denied", { status: 404 });
    }

    const item = vaultItem[0];

    // 生成签名 URL（有效期 1 小时）
    const { data: signedUrl, error } = await supabaseAdmin.storage
      .from('vault')
      .createSignedUrl(item.storagePath, 3600);

    if (error) {
      console.error("Failed to create signed URL:", error);
      return new Response(JSON.stringify({ 
        error: "Failed to generate download URL",
        details: error.message 
      }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      downloadUrl: signedUrl.signedUrl,
      fileName: item.storagePath.split('/').pop(),
      expiresIn: 3600, // 1 hour
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Vault download error:", error);
    return new Response(JSON.stringify({ 
      error: "Download failed",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 