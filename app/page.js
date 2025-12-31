'use client';
import { useState, useEffect } from 'react';

export default function ERP() {
  // --- AUTH ---
  const [view, setView] = useState('login'); 
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- DATA ---
  const [dashboardData, setDashboardData] = useState(null);
  const [empData, setEmpData] = useState(null);
  const [adminTab, setAdminTab] = useState('overview'); // overview, employees, approvals

  // --- ADMIN INPUTS ---
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpID, setNewEmpID] = useState('');
  const [newEmpPass, setNewEmpPass] = useState('');
  const [newEmpDOJ, setNewEmpDOJ] = useState('');
  const [manualAttendUser, setManualAttendUser] = useState('');
  const [adminRemark, setAdminRemark] = useState('');

  // --- EMPLOYEE INPUTS ---
  const [transferTo, setTransferTo] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // ---------------- LOGIN ----------------
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
        loadEmployeeData(data.user.role);
        setView('employee');
      }
    } else {
      alert('❌ ' + data.message);
    }
  }

  // ---------------- ADMIN ACTIONS ----------------
  async function loadAdminData() {
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) });
    const data = await res.json();
    if (data.success) setDashboardData(data);
  }

  async function createEmployee() {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'create_employee', username: newEmpID, password: newEmpPass, fullName: newEmpName, doj: newEmpDOJ })
    });
    alert('Employee Created Successfully');
    loadAdminData();
  }

  async function manualAttendance() {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'manual_attendance', username: manualAttendUser, location: 'Admin Override' })
    });
    alert('Attendance Marked');
    loadAdminData();
  }

  async function reviewTask(id, status) {
    const remark = prompt("Enter Remark for " + status + ":");
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'review_task', taskId: id, status: status, remark: remark })
    });
    loadAdminData();
  }

  // ---------------- EMPLOYEE ACTIONS ----------------
  async function loadEmployeeData() {
    const res = await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'get_data', username: username }) });
    const data = await res.json();
    if (data.success) setEmpData(data);
  }

  async function transferTask(id) {
    await fetch('/api/employee', {
      method: 'POST',
      body: JSON.stringify({ action: 'transfer_task', taskId: id, transferTo: transferTo, reason: transferReason })
    });
    alert('Task Transferred');
    loadEmployeeData();
  }

  async function submitTask(id) {
    await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'complete_task', taskId: id }) });
    loadEmployeeData();
  }

  async function clockIn() {
      if (!navigator.geolocation) return alert('GPS not supported');
      navigator.geolocation.getCurrentPosition(async (position) => {
        await fetch('/api/employee', {
          method: 'POST',
          body: JSON.stringify({ action: 'clock_in', username: username, lat: position.coords.latitude, lng: position.coords.longitude })
        });
        alert('✅ GPS Clock In Successful');
      });
  }

  // ---------------- UI ----------------

  if (view === 'login') {
    return (
      <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', width: '350px', textAlign: 'center' }}>
          <h2 style={{ color: '#0f172a' }}>BITA ERP</h2>
          <p style={{marginBottom:'20px', color:'#666'}}>Secure Corporate Login</p>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', border:'1px solid #ccc'}} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'20px', border:'1px solid #ccc'}} />
          <button onClick={handleLogin} disabled={loading} style={{width:'100%', padding:'10px', background:'#f97316', color:'white', border:'none', cursor:'pointer', fontWeight:'bold'}}>
            {loading ? 'Verifying...' : 'LOGIN'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'admin' && dashboardData) {
    return (
      <div style={{ fontFamily: 'sans-serif', background: '#f1f5f9', minHeight: '100vh', padding: '20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h1 style={{ color: '#0f172a' }}>ADMIN CONSOLE</h1>
          <div>
            <button onClick={()=>setAdminTab('overview')} style={{marginRight:'10px', padding:'10px', background: adminTab==='overview'?'#0f172a':'#ccc', color:'white', border:'none'}}>Overview</button>
            <button onClick={()=>setAdminTab('employees')} style={{marginRight:'10px', padding:'10px', background: adminTab==='employees'?'#0f172a':'#ccc', color:'white', border:'none'}}>Employees</button>
            <button onClick={()=>setAdminTab('work')} style={{marginRight:'10px', padding:'10px', background: adminTab==='work'?'#0f172a':'#ccc', color:'white', border:'none'}}>Work Review</button>
            <button onClick={()=>setView('login')} style={{background:'red', color:'white', border:'none', padding:'10px'}}>Logout</button>
          </div>
        </div>

        {/* --- TAB: OVERVIEW --- */}
        {adminTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
             <div style={{ background:'white', padding:'20px', borderRadius:'8px' }}>
                <h3>Active Projects ({dashboardData.projects.length})</h3>
                {dashboardData.projects.map(p => <div key={p.id}>{p.project_name} - Budget: ₹{p.budget_total}</div>)}
             </div>
             <div style={{ background:'white', padding:'20px', borderRadius:'8px' }}>
                <h3>Live Attendance</h3>
                {dashboardData.attendance.map(a => (
                    <div key={a.id} style={{fontSize:'0.9rem', borderBottom:'1px solid #eee', padding:'5px 0'}}>
                        <strong>{a.username}</strong> - {a.location_name} - {new Date(a.clock_in_time).toLocaleTimeString()}
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* --- TAB: EMPLOYEES --- */}
        {adminTab === 'employees' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ background:'white', padding:'20px', borderRadius:'8px' }}>
              <h3>➕ Create New Employee</h3>
              <input placeholder="Full Name" onChange={e=>setNewEmpName(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}} />
              <input placeholder="Username / ID" onChange={e=>setNewEmpID(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}} />
              <input type="password" placeholder="Create Password" onChange={e=>setNewEmpPass(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}} />
              <input type="date" onChange={e=>setNewEmpDOJ(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}} />
              <button onClick={createEmployee} style={{background:'#22c55e', color:'white', border:'none', padding:'10px', width:'100%'}}>Create Account</button>
            </div>
            
            <div style={{ background:'white', padding:'20px', borderRadius:'8px' }}>
              <h3>Manual Attendance Override</h3>
              <p style={{fontSize:'0.8rem', color:'#666'}}>If employee cannot use GPS.</p>
              <select onChange={e=>setManualAttendUser(e.target.value)} style={{display:'block', width:'100%', padding:'8px', margin:'10px 0'}}>
                 <option>Select Employee</option>
                 {dashboardData.employees.map(e => <option key={e.username} value={e.username}>{e.full_name}</option>)}
              </select>
              <button onClick={manualAttendance} style={{background:'#f97316', color:'white', border:'none', padding:'10px'}}>Mark Present</button>
            </div>
          </div>
        )}

        {/* --- TAB: WORK REVIEW --- */}
        {adminTab === 'work' && (
          <div style={{ background:'white', padding:'20px', borderRadius:'8px' }}>
             <h3>Pending Approvals</h3>
             {dashboardData.tasks.filter(t => t.status === 'Submitted').map(t => (
                 <div key={t.id} style={{display:'flex', justifyContent:'space-between', padding:'15px', borderBottom:'1px solid #eee', background:'#fffbeb'}}>
                    <div>
                        <strong>{t.assigned_to}</strong> completed: "{t.description}"
                    </div>
                    <div>
                        <button onClick={()=>reviewTask(t.id, 'Successful')} style={{marginRight:'10px', background:'green', color:'white', border:'none', padding:'5px 10px'}}>Accept</button>
                        <button onClick={()=>reviewTask(t.id, 'Unsuccessful')} style={{background:'red', color:'white', border:'none', padding:'5px 10px'}}>Reject</button>
                    </div>
                 </div>
             ))}

             <h3 style={{marginTop:'30px'}}>Work History</h3>
             {dashboardData.tasks.filter(t => t.status === 'Successful' || t.status === 'Unsuccessful').slice(0,5).map(t => (
                 <div key={t.id} style={{padding:'10px', borderBottom:'1px solid #eee', color: t.status==='Successful'?'green':'red'}}>
                    [{t.status}] {t.description} ({t.assigned_to}) - Remark: {t.admin_remark}
                 </div>
             ))}
          </div>
        )}
      </div>
    );
  }

  // 3. EMPLOYEE VIEW
  if (view === 'employee' && empData) {
    return (
      <div style={{ fontFamily: 'sans-serif', background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h3>Employee: {user.full_name}</h3>
          <button onClick={() => setView('login')} style={{ background:'red', color:'white', border:'none', padding:'5px 10px' }}>Logout</button>
        </div>

        <button onClick={clockIn} style={{ width:'100%', padding:'20px', background:'#22c55e', color:'white', border:'none', fontSize:'1.2rem', fontWeight:'bold', borderRadius:'10px', marginBottom:'20px' }}>
          📍 GPS CLOCK IN
        </button>

        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom:'20px' }}>
          <h4>My Active Work</h4>
          {empData.tasks.length === 0 ? <p>No pending work.</p> : null}
          {empData.tasks.map(t => (
            <div key={t.id} style={{ padding:'15px', borderBottom:'1px solid #334155', marginBottom:'10px' }}>
              <div style={{fontSize:'1.1rem', marginBottom:'5px'}}>{t.description}</div>
              
              {/* ACTION BUTTONS */}
              <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                <button onClick={()=>submitTask(t.id)} style={{flex:1, background:'#f97316', border:'none', color:'white', padding:'8px'}}>Mark Done</button>
                
                {/* TRANSFER SECTION */}
                <div style={{flex:1, background:'#334155', padding:'5px'}}>
                   <select onChange={e=>setTransferTo(e.target.value)} style={{width:'100%', marginBottom:'5px'}}>
                      <option>Transfer To...</option>
                      {empData.colleagues.map(c => <option key={c.username} value={c.username}>{c.full_name}</option>)}
                   </select>
                   <input placeholder="Reason" onChange={e=>setTransferReason(e.target.value)} style={{width:'100%'}} />
                   <button onClick={()=>transferTask(t.id)} style={{width:'100%', marginTop:'5px', background:'#64748b', color:'white', border:'none'}}>Transfer</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px' }}>
           <h4>My Work History</h4>
           {empData.history.map(h => (
               <div key={h.id} style={{padding:'10px', borderBottom:'1px solid #334155', color:'#ccc'}}>
                  <strong>{h.description}</strong> <br/>
                  Status: <span style={{color: h.status==='Successful'?'#4ade80':h.status==='Unsuccessful'?'#f87171':'#94a3b8'}}>{h.status}</span>
                  {h.admin_remark && <div>Admin Remark: {h.admin_remark}</div>}
               </div>
           ))}
        </div>
      </div>
    );
  }

  return <div>Loading System...</div>;
}
