import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Query the Neon Database
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return NextResponse.json({ success: true, user: { full_name: user.full_name, role: user.role } });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Database Error: ' + error.message });
  }
}
