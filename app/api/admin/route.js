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

    // --- 1. GET FULL SYSTEM DATA ---
    if (action === 'get_dashboard') {
      const projects = await pool.query('SELECT * FROM projects ORDER BY id DESC');
      const staff = await pool.query("SELECT * FROM users WHERE role != 'admin' ORDER BY id DESC");
      const requests = await pool.query("SELECT f.*, p.project_name FROM fund_requests f JOIN projects p ON f.project_id = p.id ORDER BY f.id DESC");
      
      // NEW: Fetch Deep Records
      const inventory = await pool.query("SELECT i.*, p.project_name FROM inventory i JOIN projects p ON i.project_id = p.id");
      const labor = await pool.query("SELECT l.*, p.project_name FROM labor_logs l JOIN projects p ON l.project_id = p.id ORDER BY l.date DESC LIMIT 10");
      const investments = await pool.query("SELECT i.*, p.project_name FROM investments i JOIN projects p ON i.project_id = p.id ORDER BY i.transaction_date DESC");
      const documents = await pool.query("SELECT d.*, p.project_name FROM documents d JOIN projects p ON d.project_id = p.id ORDER BY d.id DESC");
      const assets = await pool.query("SELECT * FROM assets");

      // Calculate Financials
      const totalInv = investments.rows.reduce((sum, i) => sum + Number(i.amount), 0);
      const totalExp = requests.rows.filter(r => r.status === 'Approved').reduce((sum, r) => sum + Number(r.amount), 0);

      const stats = {
        revenue: totalInv, // Total Capital Injected
        expense: totalExp, // Total Capital Spent
        active: projects.rows.filter(p => p.status === 'Active').length,
        staff: staff.rows.length
      };

      return NextResponse.json({ 
        success: true, 
        projects: projects.rows, 
        staff: staff.rows, 
        requests: requests.rows, 
        inventory: inventory.rows,
        labor: labor.rows,
        investments: investments.rows,
        documents: documents.rows,
        assets: assets.rows,
        stats 
      });
    }

    // --- 2. RECORD KEEPING ACTIONS ---

    // A. Add Investment
    if (action === 'add_investment') {
      const { projectId, investor, amount, notes } = body;
      await pool.query('INSERT INTO investments (project_id, investor_name, amount, notes) VALUES ($1, $2, $3, $4)', [projectId, investor, amount, notes]);
      return NextResponse.json({ success: true });
    }

    // B. Add Document
    if (action === 'add_document') {
      const { projectId, name, category, link } = body;
      await pool.query('INSERT INTO documents (project_id, doc_name, category, file_link) VALUES ($1, $2, $3, $4)', [projectId, name, category, link]);
      return NextResponse.json({ success: true });
    }

    // C. Add/Move Asset
    if (action === 'manage_asset') {
      const { name, value, status, location } = body; // For creation
      await pool.query('INSERT INTO assets (item_name, value, status, current_location, purchase_date) VALUES ($1, $2, $3, $4, CURRENT_DATE)', [name, value, status, location]);
      return NextResponse.json({ success: true });
    }

    // --- STANDARD ACTIONS (Existing) ---
    if (action === 'add_material') {
      const { projectId, item, qty, unit, refNo } = body;
      await pool.query('INSERT INTO material_logs (project_id, item_name, transaction_type, quantity, reference_no) VALUES ($1, $2, $3, $4, $5)', [projectId, item, 'IN', qty, refNo]);
      const check = await pool.query('SELECT * FROM inventory WHERE project_id = $1 AND item_name = $2', [projectId, item]);
      if (check.rows.length > 0) await pool.query('UPDATE inventory SET quantity = quantity + $1 WHERE id = $2', [qty, check.rows[0].id]);
      else await pool.query('INSERT INTO inventory (project_id, item_name, quantity, unit) VALUES ($1, $2, $3, $4)', [projectId, item, qty, unit]);
      return NextResponse.json({ success: true });
    }
    if (action === 'add_labor') {
      const { projectId, masons, helpers, wages } = body;
      await pool.query('INSERT INTO labor_logs (project_id, mason_count, helper_count, total_wages, date) VALUES ($1, $2, $3, $4, CURRENT_DATE)', [projectId, masons, helpers, wages]);
      return NextResponse.json({ success: true });
    }
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
      const { name, client, value, start, status } = body;
      await pool.query('INSERT INTO projects (project_name, client_name, budget_total, start_date, status, completion_percent) VALUES ($1, $2, $3, $4, $5, 0)', [name, client, value, start, status || 'Planning']);
      return NextResponse.json({ success: true });
    }
    if (action === 'handle_request') {
      const { id, status } = body;
      await pool.query('UPDATE fund_requests SET status = $1 WHERE id = $2', [status, id]);
      return NextResponse.json({ success: true });
    }
    // Delete/Reset logic remains same as before...
    if (action === 'delete_resource') {
       const { type, id } = body;
       if (type === 'project') {
         await pool.query('DELETE FROM fund_requests WHERE project_id = $1', [id]);
         await pool.query('DELETE FROM work_logs WHERE project_id = $1', [id]);
         await pool.query('DELETE FROM inventory WHERE project_id = $1', [id]);
         await pool.query('DELETE FROM investments WHERE project_id = $1', [id]); // NEW
         await pool.query('DELETE FROM documents WHERE project_id = $1', [id]); // NEW
         await pool.query('DELETE FROM projects WHERE id = $1', [id]);
       } else if (type === 'employee') await pool.query('DELETE FROM users WHERE id = $1', [id]);
       return NextResponse.json({ success: true });
    }
    if (action === 'reset_password') {
       const { id } = body;
       const hashed = await bcrypt.hash('123456', 10);
       await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id]);
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
