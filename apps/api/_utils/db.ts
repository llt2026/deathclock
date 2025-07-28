import { Client } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

let cached: NodePgDatabase | null = null;

export function getDb(): NodePgDatabase {
  if (cached) return cached;
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set");
    throw new Error("Database connection not configured. Please set DATABASE_URL environment variable.");
  }
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  
  client.connect().catch(error => {
    console.error("Database connection failed:", error);
    throw new Error(`Failed to connect to database: ${error.message}`);
  });
  
  // Note: Vercel Serverless 每次冷启动都会重新建立连接
  cached = drizzle(client);
  return cached;
} 