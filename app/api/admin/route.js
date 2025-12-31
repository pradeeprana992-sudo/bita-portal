import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. FETCH DASHBOARD DATA
    if (action === 'get_dashboard') {
      const projects = await pool.query('SELECT * FROM projects');
      const tokens = await pool.query('SELECT * FROM tokens ORDER BY id DESC');
      const attendance = await pool.query('SELECT * FROM attendance ORDER BY clock_in_time DESC LIMIT 10');
      const employees = await pool.query("SELECT username, full_name FROM users WHERE role = 'employee'");
      
      return NextResponse.json({ success: true, projects: projects.rows, tokens: tokens.rows, attendance: attendance.rows, employees: employees.rows });
    }

    // 2. CREATE PROJECT
    if (action === 'create_project') {
      const { name, budget } = body;
      await pool.query('INSERT INTO projects (project_name, budget_total, budget_paid, status, completion_percent) VALUES ($1, $2, 0, $3, 0)', [name, budget, 'Active']);
      return NextResponse.json({ success: true });
    }

    // 3. ASSIGN TASK
    if (action === 'assign_task') {
      const { description, employee, projectId } = body;
      await pool.query('INSERT INTO tasks (description, assigned_to, project_id) VALUES ($1, $2, $3)', [description, employee, projectId]);
      return NextResponse.json({ success: true });
    }

    // 4. APPROVE/REJECT TOKEN
    if (action === 'update_token') {
      const { tokenId, status } = body;
      await pool.query('UPDATE tokens SET status = $1 WHERE id = $2', [status, tokenId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid Action' });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
