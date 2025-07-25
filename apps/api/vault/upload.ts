import { getDb } from "../_utils/db";
import { legacyVault } from "../../../packages/db/schema";
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
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const type = formData.get('type') as string;
    const trigger = formData.get('trigger') as string;
    const triggerValue = formData.get('triggerValue') as string;
    const file = formData.get('file') as File;

    if (!userId || !type || !trigger || !file) {
      return new Response("Missing required fields: userId, type, trigger, file", { status: 400 });
    }

    // 生成唯一存储路径
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'bin';
    const storagePath = `vault/${userId}/${timestamp}-${file.name}`;

    // 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('vault')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(JSON.stringify({ 
        error: "Storage upload failed",
        details: uploadError.message 
      }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // 保存元数据到数据库
    const db = getDb();
    const result = await db.insert(legacyVault).values({
      userId,
      type: type as any,
      storagePath: uploadData.path,
      trigger: trigger as any,
      triggerValue: triggerValue ? new Date(triggerValue).toISOString().split('T')[0] : null,
      delivered: false,
    }).returning();

    return new Response(JSON.stringify({ 
      success: true, 
      vaultId: result[0].id,
      storagePath: uploadData.path,
      fileName: file.name,
      fileSize: file.size,
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Vault upload error:", error);
    return new Response(JSON.stringify({ 
      error: "Upload failed",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 