import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL || 
  `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;

if (!databaseUrl || databaseUrl.includes('undefined')) {
  console.error('Database configuration missing. Available env vars:', {
    DATABASE_URL: !!process.env.DATABASE_URL,
    PGUSER: !!process.env.PGUSER,
    PGHOST: !!process.env.PGHOST,
    PGPORT: !!process.env.PGPORT,
    PGDATABASE: !!process.env.PGDATABASE,
  });
  throw new Error(
    "Database configuration is incomplete. Please check your environment variables.",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });