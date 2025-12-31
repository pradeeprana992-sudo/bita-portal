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

    // --- 1. GET RICH DASHBOARD DATA ---
    if (action === 'get_dashboard') {
      const projects = await pool.query('SELECT * FROM projects ORDER BY id DESC');
      const employees = await pool.query("SELECT username, full_name, role, date_of_joining FROM users WHERE role = 'employee'");
      const tokens = await pool.query('SELECT * FROM tokens ORDER BY status DESC, id DESC');
      const attendance = await pool.query('SELECT * FROM attendance ORDER BY clock_in_time DESC LIMIT 15');
      
      // Get Work Logs (New Feature)
      // Note: If you haven't added work_logs table yet, this part might return empty, which is fine.
      let workLogs = { rows: [] };
      try {
        workLogs = await pool.query(`
          SELECT w.*, p.project_name 
          FROM work_logs w 
          JOIN projects p ON w.project_id = p.id 
          ORDER BY w.log_date DESC, w.id DESC LIMIT 20
        `);
      } catch (e) { console.log("Work logs table missing, skipping"); }

      // Calculate Total Stats
      const stats = {
        total_projects: projects.rows.length,
        active_projects: projects.rows.filter(p => p.status === 'Active').length,
        total_budget: projects.rows.reduce((sum, p) => sum + Number(p.budget_total), 0),
        total_spent: projects.rows.reduce((sum, p) => sum + Number(p.budget_paid), 0)
      };
      
      return NextResponse.json({ success: true, projects: projects.rows, employees: employees.rows, tokens: tokens.rows, attendance: attendance.rows, workLogs: workLogs.rows, stats });
    }

    // --- 2. CREATE ADVANCED PROJECT ---
    if (action === 'create_project') {
      const { name, client, budget, start, end, status } = body;
      await pool.query(
        'INSERT INTO projects (project_name, client_name, budget_total, budget_paid, start_date, end_date, status, completion_percent) VALUES ($1, $2, $3, 0, $4, $5, $6, 0)',
        [name, client, budget, start, end, status || 'Planning']
      );
      return NextResponse.json({ success: true });
    }

    // --- 3. APPROVE TOKEN (Cost Control) ---
    if (action === 'update_token') {
      const { tokenId, status, amount, projectId } = body;
      await pool.query('UPDATE tokens SET status = $1 WHERE id = $2', [status, tokenId]);
      
      // If approved, add to "Budget Paid" of that project
      if (status === 'Approved') {
         await pool.query('UPDATE projects SET budget_paid = budget_paid + $1 WHERE id = $2', [amount, projectId]);
      }
      return NextResponse.json({ success: true });
    }

    // --- 4. CREATE EMPLOYEE ---
    if (action === 'create_employee') {
      const { username, password, fullName, doj } = body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (username, password, full_name, role, date_of_joining) VALUES ($1, $2, $3, $4, $5)', 
        [username, hashedPassword, fullName, 'employee', doj]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid Action' });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
