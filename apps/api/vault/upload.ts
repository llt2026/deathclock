import { getDb } from "../_utils/db";
import { legacyVault } from "../../../packages/db/schema";

export const config = { runtime: "nodejs" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { 
      userId, 
      type, 
      trigger, 
      triggerValue, 
      encryptedData,
      filename 
    } = await request.json();

    if (!userId || !type || !trigger || !encryptedData) {
      return new Response("Missing required fields", { status: 400 });
    }

    // 生成存储路径
    const storagePath = `vault/${userId}/${Date.now()}-${filename || 'untitled'}`;
    
    // TODO: 实际上传到 Supabase Storage
    // const { data, error } = await supabase.storage
    //   .from('vault')
    //   .upload(storagePath, encryptedData);

    // 保存元数据到数据库
    const db = getDb();
    const result = await db.insert(legacyVault).values({
      userId,
      type,
      storagePath,
      trigger,
      triggerValue: triggerValue ? new Date(triggerValue).toISOString().split('T')[0] : null,
      delivered: false,
    }).returning();

    return new Response(JSON.stringify({ 
      success: true, 
      vaultId: result[0].id,
      storagePath 
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Vault upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 