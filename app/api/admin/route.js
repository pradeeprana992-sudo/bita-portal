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

    // --- 1. DASHBOARD LOAD (Updated with History) ---
    if (action === 'get_dashboard') {
      const projects = await pool.query('SELECT * FROM projects');
      const tokens = await pool.query('SELECT * FROM tokens ORDER BY id DESC');
      // Get attendance (Live + Manual)
      const attendance = await pool.query('SELECT * FROM attendance ORDER BY clock_in_time DESC LIMIT 20');
      const employees = await pool.query("SELECT username, full_name, date_of_joining FROM users WHERE role = 'employee'");
      // Get Tasks (Active & History)
      const tasks = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
      
      return NextResponse.json({ success: true, projects: projects.rows, tokens: tokens.rows, attendance: attendance.rows, employees: employees.rows, tasks: tasks.rows });
    }

    // --- 2. CREATE EMPLOYEE (Admin Only) ---
    if (action === 'create_employee') {
      const { username, password, fullName, doj } = body;
      // Hash the password so it is secure
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await pool.query(
        'INSERT INTO users (username, password, full_name, role, date_of_joining) VALUES ($1, $2, $3, $4, $5)', 
        [username, hashedPassword, fullName, 'employee', doj]
      );
      return NextResponse.json({ success: true });
    }

    // --- 3. RESET PASSWORD ---
    // Note: We cannot "Retrieve" a hashed password, we can only set a new one.
    if (action === 'reset_password') {
      const { username, newPassword } = body;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, username]);
      return NextResponse.json({ success: true });
    }

    // --- 4. MANUAL ATTENDANCE ---
    if (action === 'manual_attendance') {
      const { username, location } = body;
      await pool.query(
        'INSERT INTO attendance (username, location_name, latitude, longitude) VALUES ($1, $2, 0, 0)', 
        [username, location || 'Manual Entry by Admin']
      );
      return NextResponse.json({ success: true });
    }

    // --- 5. APPROVE/REJECT WORK ---
    if (action === 'review_task') {
      const { taskId, status, remark } = body; // Status: 'Successful', 'Unsuccessful'
      await pool.query(
        'UPDATE tasks SET status = $1, admin_remark = $2 WHERE id = $3', 
        [status, remark, taskId]
      );
      return NextResponse.json({ success: true });
    }

    // --- Standard Actions ---
    if (action === 'create_project') {
      const { name, budget } = body;
      await pool.query('INSERT INTO projects (project_name, budget_total, budget_paid, status, completion_percent) VALUES ($1, $2, 0, $3, 0)', [name, budget, 'Active']);
      return NextResponse.json({ success: true });
    }
    if (action === 'assign_task') {
      const { description, employee, projectId } = body;
      await pool.query('INSERT INTO tasks (description, assigned_to, project_id, status) VALUES ($1, $2, $3, $4)', [description, employee, projectId, 'Pending']);
      return NextResponse.json({ success: true });
    }
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
