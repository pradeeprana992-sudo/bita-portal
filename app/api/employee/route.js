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

    // --- 1. GET DATA ---
    if (action === 'get_data') {
      const tasks = await pool.query("SELECT * FROM tasks WHERE assigned_to = $1 AND status IN ('Pending', 'In Progress')", [username]);
      const myTokens = await pool.query('SELECT * FROM tokens WHERE requested_by = $1 ORDER BY id DESC LIMIT 5', [username]);
      const projects = await pool.query('SELECT * FROM projects WHERE status = $1', ['Active']);
      
      return NextResponse.json({ success: true, tasks: tasks.rows, tokens: myTokens.rows, projects: projects.rows });
    }

    // --- 2. SUBMIT DAILY REPORT (New) ---
    if (action === 'submit_report') {
      const { projectId, activity, material, photoLink } = body;
      await pool.query(
        'INSERT INTO work_logs (project_id, username, activity_description, material_used, photo_link, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [projectId, username, activity, material, photoLink, 'On Track']
      );
      return NextResponse.json({ success: true });
    }

    // --- 3. CLOCK IN ---
    if (action === 'clock_in') {
      const { lat, lng } = body;
      await pool.query('INSERT INTO attendance (username, latitude, longitude, location_name) VALUES ($1, $2, $3, $4)', [username, lat, lng, 'GPS Lock']);
      return NextResponse.json({ success: true });
    }

    // --- 4. RAISE TOKEN ---
    if (action === 'raise_token') {
      const { projectId, amount, reason } = body;
      await pool.query('INSERT INTO tokens (requested_by, project_id, amount, reason) VALUES ($1, $2, $3, $4)', [username, projectId, amount, reason]);
      return NextResponse.json({ success: true });
    }

    // --- 5. COMPLETE TASK ---
    if (action === 'complete_task') {
      const { taskId } = body;
      await pool.query('UPDATE tasks SET status = $1 WHERE id = $2', ['Submitted', taskId]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, message: 'Invalid Action' });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
