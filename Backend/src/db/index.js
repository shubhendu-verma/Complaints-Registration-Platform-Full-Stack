import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

// Enable SSL and pooling settings for production (Supabase/Render)
const client = postgres(connectionString, {
  ssl: 'require',
  prepare: false, 
  max: 10,         // Increased from 1
  idle_timeout: 30,
  connect_timeout: 20
});

export const db = drizzle(client, { schema });
export { client };
