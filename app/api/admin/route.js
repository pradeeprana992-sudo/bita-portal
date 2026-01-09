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

    // --- 1. GET FULL DASHBOARD (REAL DATA) ---
    if (action === 'get_dashboard') {
      // Get Projects
      const projectsRes = await pool.query('SELECT * FROM projects ORDER BY id DESC');
      const projects = projectsRes.rows;

      // Get Stages for each project
      for (let p of projects) {
        const stagesRes = await pool.query('SELECT * FROM project_stages WHERE project_id = $1 ORDER BY id ASC', [p.id]);
        p.stages = stagesRes.rows;
      }

      // Get Staff
      const staffRes = await pool.query("SELECT id, username, full_name, role, phone, email, current_site, status, date_of_joining FROM users WHERE role != 'admin' ORDER BY id DESC");
      
      // Calculate Stats
      const stats = {
        revenue: projects.reduce((sum, p) => sum + Number(p.revenue_recognized || 0), 0),
        active_count: projects.filter(p => p.status === 'Active').length,
        staff_count: staffRes.rows.length,
        growth: '15.2%' // You can calculate this dynamically later
      };

      return NextResponse.json({ success: true, projects, staff: staffRes.rows, stats });
    }

    // --- 2. CREATE PROJECT ---
    if (action === 'create_project') {
      const { name, client, value, start, end, status } = body;
      const res = await pool.query(
        'INSERT INTO projects (project_name, client_name, budget_total, start_date, end_date, status, completion_percent) VALUES ($1, $2, $3, $4, $5, $6, 0) RETURNING id',
        [name, client, value, start, end, status || 'Planning']
      );
      
      // Add Default Stages
      const pid = res.rows[0].id;
      const defaultStages = [
        { n: 'Site Clearance', s: 'Pending' },
        { n: 'Foundation', s: 'Pending' },
        { n: 'Structure', s: 'Pending' },
        { n: 'Finishing', s: 'Pending' }
      ];
      for (let s of defaultStages) {
        await pool.query('INSERT INTO project_stages (project_id, stage_name, status, stage_date) VALUES ($1, $2, $3, $4)', [pid, s.n, s.s, 'TBD']);
      }

      return NextResponse.json({ success: true });
    }

    // --- 3. CREATE EMPLOYEE ---
    if (action === 'create_employee') {
      const { fullName, phone, email, role, password, site } = body;
      
      // Auto-Generate ID (BIS001...)
      const countRes = await pool.query("SELECT COUNT(*) FROM users");
      const nextId = parseInt(countRes.rows[0].count) + 1;
      const username = `BIS${nextId.toString().padStart(3, '0')}`;
      
      const hashed = await bcrypt.hash(password, 10);
      
      await pool.query(
        'INSERT INTO users (username, password, full_name, role, phone, email, current_site, status, date_of_joining) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE)', 
        [username, hashed, fullName, role, phone, email, site, 'Active']
      );
      return NextResponse.json({ success: true, newId: username });
    }

    return NextResponse.json({ success: false, message: 'Invalid Action' });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
