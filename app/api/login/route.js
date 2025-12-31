import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // 1. Find the user
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // 2. COMPARE the plain password with the Scrambled one
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      return NextResponse.json({ success: true, user: { full_name: user.full_name, role: user.role } });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid Password' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server Error' });
  }
}
