import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, username } = body;

    // --- 1. GET DATA (With History) ---
    if (action === 'get_data') {
      // Active Tasks
      const tasks = await pool.query("SELECT * FROM tasks WHERE assigned_to = $1 AND status IN ('Pending', 'In Progress')", [username]);
      // History (Completed/Transferred/Failed)
      const history = await pool.query("SELECT * FROM tasks WHERE assigned_to = $1 AND status NOT IN ('Pending', 'In Progress') ORDER BY id DESC", [username]);
      
      const myTokens = await pool.query('SELECT * FROM tokens WHERE requested_by = $1', [username]);
      const projects = await pool.query('SELECT * FROM projects');
      const colleagues = await pool.query("SELECT username, full_name FROM users WHERE role = 'employee' AND username != $1", [username]);

      return NextResponse.json({ success: true, tasks: tasks.rows, history: history.rows, tokens: myTokens.rows, projects: projects.rows, colleagues: colleagues.rows });
    }

    // --- 2. TRANSFER TASK ---
    if (action === 'transfer_task') {
      const { taskId, transferTo, reason } = body;
      // We update the task: assign it to new person, but keep a record or log it
      // Simple way: Update assigned_to, set original_owner to current user, add reason
      await pool.query(
        'UPDATE tasks SET assigned_to = $1, original_owner = $2, transfer_reason = $3 WHERE id = $4',
        [transferTo, username, reason, taskId]
      );
      return NextResponse.json({ success: true });
    }

    // --- 3. SUBMIT TASK FOR REVIEW ---
    if (action === 'complete_task') {
      const { taskId } = body;
      // Employee marks it 'Submitted', Admin will mark 'Successful' later
      await pool.query('UPDATE tasks SET status = $1, completion_date = NOW() WHERE id = $2', ['Submitted', taskId]);
      return NextResponse.json({ success: true });
    }

    // --- Standard Actions ---
    if (action === 'clock_in') {
      const { lat, lng } = body;
      await pool.query('INSERT INTO attendance (username, latitude, longitude, location_name) VALUES ($1, $2, $3, $4)', [username, lat, lng, 'GPS Lock']);
      return NextResponse.json({ success: true });
    }
    if (action === 'raise_token') {
      const { projectId, amount, reason } = body;
      await pool.query('INSERT INTO tokens (requested_by, project_id, amount, reason) VALUES ($1, $2, $3, $4)', [username, projectId, amount, reason]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid Action' });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
