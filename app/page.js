'use client';
import { useState, useEffect } from 'react';

export default function BitaERP() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile Toggle
  
  // Data Stores
  const [adminData, setAdminData] = useState(null);
  const [empData, setEmpData] = useState(null);

  // Forms
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newProject, setNewProject] = useState({ name: '', client: '', budget: '', start: '', end: '', status: 'Planning' });
  const [reportForm, setReportForm] = useState({ projectId: '', activity: '', material: '', photoLink: '' });
  const [tokenForm, setTokenForm] = useState({ projectId: '', amount: '', reason: '' });
  const [resetPass, setResetPass] = useState({ username: '', newPass: '' });

  // Theme
  const theme = {
    sidebar: '#1e293b', bg: '#f1f5f9', primary: '#f97316', text: '#334155', card: '#ffffff', border: '#e2e8f0'
  };

  // --- ACTIONS ---
  async function handleLogin() {
    setLoading(true);
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    });
    const result = await res.json();
    setLoading(false);
    
    if (result.success) {
      setUser(result.user);
      if (result.user.role === 'admin') {
        loadAdminData();
        setView('admin');
      } else {
        loadEmployeeData(result.user.username);
        setView('employee');
      }
    } else {
      alert('❌ ' + result.message);
    }
  }

  async function loadAdminData() {
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) });
    const result = await res.json();
    if (result.success) setAdminData(result);
  }

  async function loadEmployeeData(username) {
    const res = await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'get_data', username: username || user.username }) });
    const result = await res.json();
    if (result.success) setEmpData(result);
  }

  // Admin Functions
  async function createProject() {
    await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'create_project', ...newProject }) });
    alert('Project Created'); loadAdminData(); setActiveTab('projects');
  }
  async function handleToken(id, status, amount, projectId) {
    await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'update_token', tokenId: id, status, amount, projectId }) });
    loadAdminData();
  }
  async function resetPassword() {
    await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'reset_password', username: resetPass.username, newPassword: resetPass.newPass }) });
    alert('Password Reset Successful'); loadAdminData();
  }

  // Employee Functions
  async function clockIn() {
    if (!navigator.geolocation) return alert('GPS Error');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'clock_in', username: user.username, lat: pos.coords.latitude, lng: pos.coords.longitude }) });
      alert('✅ Clocked In');
    });
  }
  async function submitReport() {
    await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'submit_report', username: user.username, ...reportForm }) });
    alert('Report Submitted'); setReportForm({ projectId: '', activity: '', material: '', photoLink: '' });
  }
  async function raiseToken() {
    await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'raise_token', username: user.username, ...tokenForm }) });
    alert('Request Sent'); setTokenForm({ projectId: '', amount: '', reason: '' }); loadEmployeeData();
  }

  // --- VIEWS ---

  if (view === 'login') {
    return (
      <div style={{ height: '100vh', background: theme.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ color: theme.sidebar, marginBottom: '20px' }}>BITA ERP</h2>
          <input placeholder="Username" onChange={e=>setLoginForm({...loginForm, username:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'10px', border:'1px solid #ccc', borderRadius:'5px'}} />
          <input type="password" placeholder="Password" onChange={e=>setLoginForm({...loginForm, password:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'20px', border:'1px solid #ccc', borderRadius:'5px'}} />
          <button onClick={handleLogin} disabled={loading} style={{width:'100%', padding:'12px', background: theme.primary, color:'white', border:'none', borderRadius:'5px', fontWeight:'bold'}}>
            {loading ? '...' : 'LOGIN'}
          </button>
        </div>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (view === 'admin' && adminData) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: theme.bg, flexDirection: 'column' }}>
        
        {/* MOBILE HEADER */}
        <div style={{ background: theme.sidebar, padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>BITA ADMIN</div>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:'none', border:'none', color:'white', fontSize:'1.5rem'}}>☰</button>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {/* SIDEBAR (Responsive) */}
          <div style={{ 
            width: '250px', background: theme.sidebar, color: 'white', padding: '20px', 
            display: sidebarOpen ? 'block' : 'none', // Hide on mobile unless open
            position: 'absolute', height: '100%', zIndex: 100, top: '50px'
          }}>
             {['Dashboard', 'Projects', 'Finance', 'Reports', 'Team'].map(item => (
                <div key={item} onClick={() => {setActiveTab(item.toLowerCase()); setSidebarOpen(false);}}
                  style={{ padding: '12px', marginBottom: '5px', borderRadius: '5px', cursor: 'pointer', background: activeTab === item.toLowerCase() ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === item.toLowerCase() ? theme.primary : '#ccc' }}>
                  {item}
                </div>
             ))}
             <button onClick={()=>setView('login')} style={{marginTop:'20px', background:'red', border:'none', color:'white', padding:'10px', width:'100%', borderRadius:'5px'}}>Logout</button>
          </div>

          {/* DESKTOP SIDEBAR TRICK (Always show on big screens) */}
          <style jsx>{` @media (min-width: 768px) { div[style*="display: none"] { display: block !important; position: static !important; } } `}</style>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            
            {activeTab === 'dashboard' && (
               <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div style={{background:'white', padding:'20px', borderRadius:'10px'}}>Active Projects: <b>{adminData.stats.active_projects}</b></div>
                  <div style={{background:'white', padding:'20px', borderRadius:'10px'}}>Budget: <b>₹{(adminData.stats.total_budget/100000).toFixed(1)}L</b></div>
                  <div style={{background:'white', padding:'20px', borderRadius:'10px'}}>Spent: <b style={{color:theme.primary}}>₹{(adminData.stats.total_spent/100000).toFixed(1)}L</b></div>
               </div>
            )}

            {activeTab === 'team' && (
               <div style={{background:'white', padding:'20px', borderRadius:'10px'}}>
                  <h3>Employee Management</h3>
                  <div style={{marginBottom:'20px', padding:'15px', background:'#f8fafc', border:'1px solid #eee'}}>
                     <h4>Reset Password</h4>
                     <select onChange={e=>setResetPass({...resetPass, username:e.target.value})} style={{padding:'8px', marginRight:'10px'}}>
                        <option>Select User</option>
                        {adminData.employees.map(e=><option key={e.username} value={e.username}>{e.full_name}</option>)}
                     </select>
                     <input placeholder="New Password" onChange={e=>setResetPass({...resetPass, newPass:e.target.value})} style={{padding:'8px', marginRight:'10px'}} />
                     <button onClick={resetPassword} style={{padding:'8px', background:'red', color:'white', border:'none'}}>Reset</button>
                  </div>
                  <table style={{width:'100%', borderCollapse:'collapse'}}>
                     <thead><tr style={{background:'#eee', textAlign:'left'}}><th>Name</th><th>Username</th><th>Joined</th></tr></thead>
                     <tbody>
                        {adminData.employees.map(e=>(
                           <tr key={e.username} style={{borderBottom:'1px solid #eee'}}>
                              <td style={{padding:'10px'}}>{e.full_name}</td>
                              <td>{e.username}</td>
                              <td>{new Date(e.date_of_joining).toLocaleDateString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {activeTab === 'reports' && (
               <div style={{background:'white', padding:'20px', borderRadius:'10px'}}>
                  <h3>Daily Work Logs</h3>
                  {adminData.workLogs.map(log => (
                     <div key={log.id} style={{padding:'15px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                           <strong>{log.project_name}</strong> - {log.activity_description}
                           <div style={{fontSize:'0.8rem', color:'#666'}}>{log.username} | {new Date(log.log_date).toLocaleDateString()}</div>
                        </div>
                        {log.photo_link && <a href={log.photo_link} target="_blank" style={{color:'blue', textDecoration:'underline'}}>View Photo</a>}
                     </div>
                  ))}
               </div>
            )}
            
            {/* Reuse Projects & Finance from previous code if needed, keeping it simple here for space */}
            {activeTab === 'projects' && <h2>Project Management (See Previous Code for Full UI)</h2>}
            {activeTab === 'finance' && <h2>Finance (See Previous Code for Full UI)</h2>}

          </div>
        </div>
      </div>
    );
  }

  // --- EMPLOYEE VIEW ---
  if (view === 'employee' && empData) {
    return (
      <div style={{ fontFamily: 'sans-serif', background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px' }}>
         <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
            <h3>👷 {user.full_name}</h3>
            <button onClick={()=>setView('login')} style={{background:'red', color:'white', border:'none', padding:'5px 10px'}}>Logout</button>
         </div>

         <button onClick={clockIn} style={{width:'100%', padding:'20px', background:'#22c55e', color:'white', border:'none', borderRadius:'10px', fontSize:'1.2rem', fontWeight:'bold', marginBottom:'20px'}}>
            📍 GPS CLOCK IN
         </button>

         <div style={{background:'#1e293b', padding:'20px', borderRadius:'10px', marginBottom:'20px'}}>
            <h4>📝 Submit Daily Report</h4>
            <select onChange={e=>setReportForm({...reportForm, projectId:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>
               <option>Select Project</option>
               {empData.projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
            <input placeholder="Activity (e.g. Wall Plastering)" onChange={e=>setReportForm({...reportForm, activity:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <input placeholder="Material Used" onChange={e=>setReportForm({...reportForm, material:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <input placeholder="Photo Link (Drive/Imgur)" onChange={e=>setReportForm({...reportForm, photoLink:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <button onClick={submitReport} style={{width:'100%', padding:'10px', background:theme.primary, color:'white', border:'none'}}>Submit Report</button>
         </div>

         <div style={{background:'#1e293b', padding:'20px', borderRadius:'10px'}}>
            <h4>💸 Request Funds</h4>
            <select onChange={e=>setTokenForm({...tokenForm, projectId:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}}>
               <option>Select Project</option>
               {empData.projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
            <input placeholder="Amount" onChange={e=>setTokenForm({...tokenForm, amount:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <input placeholder="Reason" onChange={e=>setTokenForm({...tokenForm, reason:e.target.value})} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
            <button onClick={raiseToken} style={{width:'100%', padding:'10px', background:'#3b82f6', color:'white', border:'none'}}>Send Request</button>
            
            <div style={{marginTop:'15px', borderTop:'1px solid #334155', paddingTop:'10px'}}>
               <small>Recent Requests:</small>
               {empData.tokens.map(t=>(<div key={t.id} style={{fontSize:'0.9rem', color:t.status==='Approved'?'#4ade80':'#ccc'}}>{t.reason} - {t.status}</div>))}
            </div>
         </div>
      </div>
    );
  }

  return <div style={{padding:'50px', textAlign:'center'}}>Loading System...</div>;
}
