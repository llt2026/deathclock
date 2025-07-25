import { getDb } from "../_utils/db";
import { users } from "../../../packages/db/schema";
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: "nodejs" };

// 服务端 Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration for admin operations');
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
    const { email, password, adminSecret } = await request.json();

    // 验证管理员创建密钥
    const expectedSecret = process.env.ADMIN_CREATION_SECRET || 'create_admin_secret_2024';
    if (adminSecret !== expectedSecret) {
      return new Response("Unauthorized: Invalid admin creation secret", { status: 401 });
    }

    if (!email || !password) {
      return new Response("Missing email or password", { status: 400 });
    }

    // 创建 Supabase 用户
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        is_admin: true,
      }
    });

    if (authError) {
      console.error("Supabase admin creation error:", authError);
      return new Response(JSON.stringify({ 
        error: "Failed to create admin user",
        details: authError.message 
      }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // 同步到我们的数据库
    const db = getDb();
    const result = await db
      .insert(users)
      .values({
        id: authUser.user.id,
        email: authUser.user.email!,
        displayName: 'Administrator',
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: authUser.user.email!,
          displayName: 'Administrator',
        },
      })
      .returning();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin user created successfully",
      user: {
        id: result[0].id,
        email: result[0].email,
        role: 'admin'
      }
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error("Admin creation error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to create admin user",
      details: error.message 
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
} 