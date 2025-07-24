import type { Config } from 'drizzle-kit';

export default {
  schema: './packages/db/schema.ts',
  out: './packages/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 
      "postgresql://neondb_owner:npg_yVdrA0FGK5ef@ep-misty-scene-afxve304-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  },
} satisfies Config; 