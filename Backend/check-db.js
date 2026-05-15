import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

async function checkDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is missing in .env file');
    return;
  }

  console.log('Testing connection to:', connectionString.split('@')[1]); // Log host only for safety

  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`;
    console.log('Columns in "users":', columns.map(c => c.column_name).join(', '));
    
    const required = ['id', 'email', 'password', 'role', 'is_verified'];
    const missing = required.filter(r => !columns.map(c => c.column_name).includes(r));
    
    if (missing.length > 0) {
      console.error('❌ Error: Missing columns:', missing.join(', '));
    } else {
      console.log('✅ All required columns exist.');
    }
  } catch (err) {
    console.error('❌ Database Error:', err.message);
  } finally {
    await sql.end();
  }
}

checkDb();
