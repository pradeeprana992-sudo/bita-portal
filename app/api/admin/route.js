import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // --- 1. GET DASHBOARD DATA ---
    if (action === 'get_dashboard') {
      const projects = await pool.query('SELECT * FROM projects ORDER BY id DESC');
      const staff = await pool.query("SELECT * FROM users WHERE role != 'admin' ORDER BY id DESC");
      // Get Pending Finance Requests
      const requests = await pool.query("SELECT f.*, p.project_name FROM fund_requests f JOIN projects p ON f.project_id = p.id ORDER BY f.id DESC");
      
      const stats = {
        revenue: projects.rows.reduce((sum, p) => sum + Number(p.budget_total || 0), 0), // Simulating revenue as total budget for now
        active: projects.rows.filter(p => p.status === 'Active').length,
        staff: staff.rows.length
      };

      return NextResponse.json({ success: true, projects: projects.rows, staff: staff.rows, requests: requests.rows, stats });
    }

    // --- 2. HIRE EMPLOYEE ---
    if (action === 'create_employee') {
      const { fullName, phone, role, password } = body;
      // Auto-ID: BIS001, BIS002...
      const count = await pool.query('SELECT COUNT(*) FROM users');
      const nextId = parseInt(count.rows[0].count) + 1;
      const username = `BIS${nextId.toString().padStart(3, '0')}`;
      const hashed = await bcrypt.hash(password, 10);

      await pool.query(
        'INSERT INTO users (username, password, full_name, role, phone, status, date_of_joining) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)',
        [username, hashed, fullName, role, phone, 'Active']
      );
      return NextResponse.json({ success: true, newId: username });
    }

    // --- 3. CREATE PROJECT ---
    if (action === 'create_project') {
      const { name, client, value, start } = body;
      await pool.query(
        'INSERT INTO projects (project_name, client_name, budget_total, start_date, status, completion_percent) VALUES ($1, $2, $3, $4, $5, 0)',
        [name, client, value, start, 'Planning']
      );
      return NextResponse.json({ success: true });
    }

    // --- 4. APPROVE FUNDS ---
    if (action === 'handle_request') {
      const { id, status } = body; // status = 'Approved' or 'Rejected'
      await pool.query('UPDATE fund_requests SET status = $1 WHERE id = $2', [status, id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
