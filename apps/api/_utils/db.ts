import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

let cached: NodePgDatabase | null = null;

export function getDb(): NodePgDatabase {
  if (cached) return cached;
  
  // 使用产品档案中的 Neon 数据库连接
  const connectionString = process.env.DATABASE_URL || 
    "postgresql://neondb_owner:npg_yVdrA0FGK5ef@ep-misty-scene-afxve304-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  
  if (!connectionString) {
    throw new Error("DATABASE_URL env not set");
  }
  
  const client = new Client({ connectionString });
  client.connect();
  
  // Note: Vercel Serverless 每次冷启动都会重新建立连接
  cached = drizzle(client);
  return cached;
} 