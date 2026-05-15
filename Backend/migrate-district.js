import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const sql = postgres(process.env.DATABASE_URL);

async function migrate() {
  console.log('Starting migration for District and Police Station columns...');
  try {
    await sql`
      ALTER TABLE "complaints" 
      ADD COLUMN IF NOT EXISTS "district" varchar(255) NOT NULL DEFAULT 'Unknown',
      ADD COLUMN IF NOT EXISTS "police_station" varchar(255) NOT NULL DEFAULT 'Unknown'
    `;
    console.log('✅ Columns added successfully');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sql.end();
    process.exit();
  }
}

migrate();
