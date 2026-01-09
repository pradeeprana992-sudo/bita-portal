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

    // --- 1. GET MY DATA ---
    if (action === 'get_data') {
      // Get Active Projects for Dropdown
      const projects = await pool.query("SELECT id, project_name FROM projects WHERE status = 'Active'");
      return NextResponse.json({ success: true, projects: projects.rows });
    }

    // --- 2. GPS CLOCK IN ---
    if (action === 'clock_in') {
      const { username, lat, lng } = body;
      await pool.query('INSERT INTO attendance (username, latitude, longitude) VALUES ($1, $2, $3)', [username, lat, lng]);
      return NextResponse.json({ success: true });
    }

    // --- 3. SUBMIT REPORT ---
    if (action === 'submit_report') {
      const { username, projectId, activity, material } = body;
      await pool.query('INSERT INTO work_logs (username, project_id, activity, material_used) VALUES ($1, $2, $3, $4)', [username, projectId, activity, material]);
      // Auto-update project progress (Simple logic: +1% per report)
      await pool.query('UPDATE projects SET completion_percent = completion_percent + 1 WHERE id = $1', [projectId]);
      return NextResponse.json({ success: true });
    }

    // --- 4. REQUEST FUNDS ---
    if (action === 'request_funds') {
      const { username, projectId, amount, reason } = body;
      await pool.query('INSERT INTO fund_requests (username, project_id, amount, reason) VALUES ($1, $2, $3, $4)', [username, projectId, amount, reason]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
