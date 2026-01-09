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

    // --- 1. GET DASHBOARD ---
    if (action === 'get_dashboard') {
      const projects = await pool.query('SELECT * FROM projects ORDER BY id DESC');
      const staff = await pool.query("SELECT * FROM users WHERE role != 'admin' ORDER BY id DESC");
      const requests = await pool.query("SELECT f.*, p.project_name FROM fund_requests f JOIN projects p ON f.project_id = p.id ORDER BY f.id DESC");
      
      const stats = {
        revenue: projects.rows.reduce((sum, p) => sum + Number(p.budget_total || 0), 0),
        active: projects.rows.filter(p => p.status === 'Active').length,
        staff: staff.rows.length
      };

      return NextResponse.json({ success: true, projects: projects.rows, staff: staff.rows, requests: requests.rows, stats });
    }

    // --- 2. CREATE ACTIONS ---
    if (action === 'create_employee') {
      const { fullName, phone, role, password } = body;
      const count = await pool.query('SELECT COUNT(*) FROM users');
      const nextId = parseInt(count.rows[0].count) + 1;
      const username = `BIS${nextId.toString().padStart(3, '0')}`;
      const hashed = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (username, password, full_name, role, phone, status, date_of_joining) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)', [username, hashed, fullName, role, phone, 'Active']);
      return NextResponse.json({ success: true, newId: username });
    }

    if (action === 'create_project') {
      const { name, client, value, start } = body;
      await pool.query('INSERT INTO projects (project_name, client_name, budget_total, start_date, status, completion_percent) VALUES ($1, $2, $3, $4, $5, 0)', [name, client, value, start, 'Planning']);
      return NextResponse.json({ success: true });
    }

    // --- 3. FIXING MISTAKES (NEW FEATURES) ---
    
    // DELETE Project/Employee
    if (action === 'delete_resource') {
      const { type, id } = body;
      if (type === 'project') {
        // Delete related data first (Safety)
        await pool.query('DELETE FROM fund_requests WHERE project_id = $1', [id]);
        await pool.query('DELETE FROM work_logs WHERE project_id = $1', [id]);
        await pool.query('DELETE FROM projects WHERE id = $1', [id]);
      } else if (type === 'employee') {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
      }
      return NextResponse.json({ success: true });
    }

    // RESET Password
    if (action === 'reset_password') {
      const { id } = body;
      // Default reset password: '123456'
      const hashed = await bcrypt.hash('123456', 10);
      await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id]);
      return NextResponse.json({ success: true });
    }

    // Handle Funds
    if (action === 'handle_request') {
      const { id, status } = body;
      await pool.query('UPDATE fund_requests SET status = $1 WHERE id = $2', [status, id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
