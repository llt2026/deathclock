export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../api/_utils/db";
import { legacyVault } from "../../../../../../packages/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

// 服务端 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration for server-side operations");
}

const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}) : null;

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase configuration missing" }, { status: 500 });
    }

    const url = new URL(request.url);
    const vaultId = url.searchParams.get("vaultId");
    const userId = url.searchParams.get("userId");

    if (!vaultId || !userId) {
      return NextResponse.json({ error: "Missing vaultId or userId parameter" }, { status: 400 });
    }

    const db = getDb();
    const vaultItem = await db
      .select()
      .from(legacyVault)
      .where(and(eq(legacyVault.id, vaultId), eq(legacyVault.userId, userId)))
      .limit(1);

    if (vaultItem.length === 0) {
      return NextResponse.json({ error: "Vault item not found or access denied" }, { status: 404 });
    }

    const item = vaultItem[0];
    
    // 生成签名下载URL (有效期1小时)
    const { data, error } = await supabaseAdmin.storage
      .from("vault")
      .createSignedUrl(item.storagePath, 3600);

    if (error) {
      console.error("Failed to create signed URL:", error);
      return NextResponse.json({ error: "Failed to generate download link", details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: data.signedUrl,
        fileName: item.storagePath.split("/").pop() || "vault-file",
        type: item.type,
      }
    });

  } catch (e: any) {
    console.error("Download error:", e);
    return NextResponse.json({ error: "Failed to generate download link", details: e.message }, { status: 500 });
  }
} 