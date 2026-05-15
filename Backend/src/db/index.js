import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

let db, client;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('⚠️ CRITICAL: DATABASE_URL is not set in environment variables');
} else {
  try {
    client = postgres(connectionString, {
      ssl: 'require',
      prepare: false, 
      max: 10,
      idle_timeout: 30,
      connect_timeout: 30
    });
    db = drizzle(client, { schema });
    console.log('✅ Database client initialized');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
  }
}

export { db, client };
