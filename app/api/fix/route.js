import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function GET() {
  try {
    // 1. Generate the REAL hash for 'admin123'
    const correctHash = await bcrypt.hash('admin123', 10);

    // 2. Force update the super_admin user
    await pool.query(
      "UPDATE users SET password = $1 WHERE username = 'super_admin'", 
      [correctHash]
    );

    return NextResponse.json({ success: true, message: "Password Fixed! You can login now." });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
