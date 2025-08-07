export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "../../../../../api/_utils/db";
import { legacyVault } from "../../../../../../packages/db/schema";
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

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase configuration missing. Please set SUPABASE_SERVICE_ROLE_KEY environment variable." }, { status: 500 });
    }

    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const type = formData.get("type") as string;
    const trigger = formData.get("trigger") as string;
    const triggerValue = formData.get("triggerValue") as string;
    const file = formData.get("file") as File;

    if (!userId || !type || !trigger || !file) {
      return NextResponse.json({ error: "Missing required fields: userId, type, trigger, file" }, { status: 400 });
    }

    // 生成唯一存储路径
    const timestamp = Date.now();
    const storagePath = `vault/${userId}/${timestamp}-${file.name}`;

    // 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("vault")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Storage upload failed", details: uploadError.message }, { status: 500 });
    }

    // 保存元数据到数据库
    const db = getDb();
    const result = await db
      .insert(legacyVault)
      .values({
        userId,
        type: type as any,
        storagePath: uploadData.path,
        trigger: trigger as any,
        triggerValue: triggerValue ? triggerValue.split("T")[0] : null,
        delivered: false,
      } as any)
      .returning();

    return NextResponse.json({
      success: true,
      vaultId: result[0].id,
      storagePath: uploadData.path,
      fileName: file.name,
      fileSize: file.size,
    });

  } catch (e: any) {
    console.error("Vault upload error:", e);
    return NextResponse.json({ error: "Upload failed", details: e.message }, { status: 500 });
  }
} 