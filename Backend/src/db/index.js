import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Enable SSL for production (Supabase/Render)
const client = postgres(connectionString, {
  ssl: 'require',
  prepare: false // Recommended for serverless/pooled connections
});

export const db = drizzle(client, { schema });
export { client };
