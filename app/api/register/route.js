import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function POST(request) {
  try {
    const { username, password, fullName, role } = await request.json();

    // Check if user exists
    const check = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (check.rows.length > 0) {
      return NextResponse.json({ success: false, message: 'Username already taken' });
    }

    // Scramble Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to Database
    const result = await pool.query(
      'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, hashedPassword, fullName, role || 'client']
    );

    return NextResponse.json({ success: true, user: result.rows[0] });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error: ' + error.message });
  }
}
