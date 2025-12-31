'use client';
import { useState, useEffect } from 'react';

export default function ERP() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- DATA STATE ---
  const [dashboardData, setDashboardData] = useState(null);
  const [empData, setEmpData] = useState(null);

  // --- ADMIN INPUTS ---
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [assignProject, setAssignProject] = useState('');

  // --- EMPLOYEE INPUTS ---
  const [tokenAmount, setTokenAmount] = useState('');
  const [tokenReason, setTokenReason] = useState('');
  const [tokenProject, setTokenProject] = useState('');

  // ---------------- LOGIN SYSTEM ----------------
  async function handleLogin() {
    setLoading(true);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    
    if (data.success) {
      setUser(data.user);
      if (data.user.role === 'admin') {
        loadAdminData();
        setView('admin');
      } else {
        loadEmployeeData(data.user.role); // pass role/username
        setView('employee');
      }
    } else {
      alert('❌ ' + data.message);
    }
  }

  // ---------------- ADMIN LOGIC ----------------
  async function loadAdminData() {
    const res = await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'get_dashboard' })
    });
    const data = await res.json();
    if (data.success) setDashboardData(data);
  }

  async function createProject() {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'create_project', name: newProjectName, budget: newProjectBudget })
    });
    alert('Project Created');
    loadAdminData();
  }

  async function assignTask() {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'assign_task', description: newTaskDesc, employee: assignTo, projectId: assignProject })
    });
    alert('Task Assigned');
    loadAdminData();
  }

  async function updateToken(id, status) {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_token', tokenId: id, status: status })
    });
    loadAdminData();
  }

  // ---------------- EMPLOYEE LOGIC ----------------
  async function loadEmployeeData() {
    // We use the username from state since we are logged in
    const res = await fetch('/api/employee', {
      method: 'POST',
      body: JSON.stringify({ action: 'get_data', username: username }) 
    });
    const data = await res.json();
    if (data.success) setEmpData(data);
  }

  function clockIn() {
    if (!navigator.geolocation) return alert('GPS not supported');
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await fetch('/api/employee', {
        method: 'POST',
        body: JSON.stringify({ action: 'clock_in', username: username, lat: latitude, lng: longitude })
      });
      alert('✅ Clocked In at: ' + latitude + ', ' + longitude);
    });
  }

  async function raiseToken() {
    await fetch('/api/employee', {
      method: 'POST',
      body: JSON.stringify({ action: 'raise_token', username: username, projectId: tokenProject, amount: tokenAmount, reason: tokenReason })
    });
    alert('Request Sent to Admin');
    loadEmployeeData();
  }

  async function completeTask(id) {
    await fetch('/api/employee', {
      method: 'POST',
      body: JSON.stringify({ action: 'complete_task', taskId: id })
    });
    loadEmployeeData();
  }

  // ---------------- UI RENDERING ----------------

  // 1. LOGIN SCREEN
  if (view === 'login') {
    return (
      <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', width: '350px', textAlign: 'center' }}>
          <h2 style={{ color: '#0f172a', marginBottom: '20px' }}>BITA ERP LOGIN</h2>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', border:'1px solid #ccc'}} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'20px', border:'1px solid #ccc'}} />
          <button onClick={handleLogin} disabled={loading} style={{width:'100%', padding:'10px', background:'#f97316', color:'white', border:'none', cursor:'pointer', fontWeight:'bold'}}>
            {loading ? 'Accessing...' : 'ENTER SYSTEM'}
          </button>
        </div>
      </div>
    );
  }

  // 2. ADMIN DASHBOARD
  if (view === 'admin' && dashboardData) {
    return (
      <div style={{ fontFamily: 'sans-serif', background: '#f1f5f9', minHeight: '100vh', padding: '20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h1 style={{ color: '#0f172a' }}>COMMAND CENTER</h1>
          <button onClick={() => setView('login')} style={{ background:'red', color:'white', border:'none', padding:'10px' }}>Logout</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* CREATE PROJECT */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #0f172a' }}>
            <h3>🏗️ New Project</h3>
            <input placeholder="Project Name" onChange={e=>setNewProjectName(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}} />
            <input placeholder="Budget (₹)" onChange={e=>setNewProjectBudget(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}} />
            <button onClick={createProject} style={{background:'#0f172a', color:'white', border:'none', padding:'8px 15px'}}>Create Project</button>
          </div>

          {/* ASSIGN TASK */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #f97316' }}>
            <h3>📝 Assign Task</h3>
            <select onChange={e=>setAssignTo(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}}>
              <option>Select Employee</option>
              {dashboardData.employees.map(e => <option key={e.username} value={e.username}>{e.full_name}</option>)}
            </select>
            <select onChange={e=>setAssignProject(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}}>
              <option>Select Project</option>
              {dashboardData.projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
            <input placeholder="Task (e.g. Finish Wiring)" onChange={e=>setNewTaskDesc(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}} />
            <button onClick={assignTask} style={{background:'#f97316', color:'white', border:'none', padding:'8px 15px'}}>Assign</button>
          </div>

        </div>

        {/* TOKEN APPROVALS */}
        <h3 style={{ marginTop: '30px' }}>💰 Pending Token Requests</h3>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          {dashboardData.tokens.filter(t => t.status === 'Pending').length === 0 ? <p>No pending requests.</p> : null}
          {dashboardData.tokens.filter(t => t.status === 'Pending').map(t => (
            <div key={t.id} style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', padding:'10px 0' }}>
              <span><strong>{t.requested_by}</strong> needs <strong>₹{t.amount}</strong> for {t.reason}</span>
              <div>
                <button onClick={()=>updateToken(t.id, 'Approved')} style={{background:'green', color:'white', border:'none', padding:'5px 10px', marginRight:'5px'}}>Approve</button>
                <button onClick={()=>updateToken(t.id, 'Rejected')} style={{background:'red', color:'white', border:'none', padding:'5px 10px'}}>Reject</button>
              </div>
            </div>
          ))}
        </div>

        {/* GPS TRACKING */}
        <h3 style={{ marginTop: '30px' }}>📍 Live Attendance</h3>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
          {dashboardData.attendance.map(a => (
            <div key={a.id} style={{ padding:'5px 0', borderBottom:'1px solid #eee' }}>
              <strong>{a.username}</strong> clocked in at {new Date(a.clock_in_time).toLocaleTimeString()} 
              <span style={{ fontSize:'0.8rem', color:'#666', marginLeft:'10px' }}>Lat: {a.latitude}, Lng: {a.longitude}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. EMPLOYEE DASHBOARD
  if (view === 'employee' && empData) {
    return (
      <div style={{ fontFamily: 'sans-serif', background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h3>FIELD APP: {user.full_name}</h3>
          <button onClick={() => setView('login')} style={{ background:'red', color:'white', border:'none', padding:'5px 10px' }}>Logout</button>
        </div>

        {/* CLOCK IN */}
        <button onClick={clockIn} style={{ width:'100%', padding:'20px', background:'#22c55e', color:'white', border:'none', fontSize:'1.2rem', fontWeight:'bold', borderRadius:'10px', marginBottom:'20px' }}>
          📍 GPS CLOCK IN
        </button>

        {/* MY TASKS */}
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom:'20px' }}>
          <h4>My Targets</h4>
          {empData.tasks.length === 0 ? <p style={{color:'#94a3b8'}}>No active tasks.</p> : null}
          {empData.tasks.map(t => (
            <div key={t.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #334155' }}>
              <span>{t.description}</span>
              <button onClick={()=>completeTask(t.id)} style={{background:'#f97316', border:'none', color:'white', padding:'5px'}}>Done</button>
            </div>
          ))}
        </div>

        {/* RAISE TOKEN */}
        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px' }}>
          <h4>💸 Request Funds / Material</h4>
          <select onChange={e=>setTokenProject(e.target.value)} style={{width:'100%', padding:'10px', margin:'5px 0', borderRadius:'5px'}}>
             <option>Select Project</option>
             {empData.projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
          </select>
          <input placeholder="Amount or Item Name" onChange={e=>setTokenAmount(e.target.value)} style={{width:'100%', padding:'10px', margin:'5px 0', borderRadius:'5px'}} />
          <input placeholder="Reason (e.g. Cement Bags)" onChange={e=>setTokenReason(e.target.value)} style={{width:'100%', padding:'10px', margin:'5px 0', borderRadius:'5px'}} />
          <button onClick={raiseToken} style={{ width:'100%', padding:'10px', background:'#3b82f6', color:'white', border:'none', marginTop:'10px', borderRadius:'5px' }}>
            Send Request
          </button>
        </div>

        {/* MY REQUEST STATUS */}
        <div style={{ marginTop:'20px' }}>
          <h4>My Recent Requests</h4>
          {empData.tokens.slice(0,5).map(t => (
            <div key={t.id} style={{ padding:'10px', background: t.status==='Approved'?'green':t.status==='Rejected'?'red':'#334155', margin:'5px 0', borderRadius:'5px' }}>
              {t.reason} - {t.status}
            </div>
          ))}
        </div>

      </div>
    );
  }

  return <div>Loading...</div>;
}
