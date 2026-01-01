'use client';
import { useState } from 'react';

export default function BitaERP() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data Stores
  const [adminData, setAdminData] = useState(null);
  const [empData, setEmpData] = useState(null);

  // Forms
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // Admin Forms
  const [newProject, setNewProject] = useState({ name: '', client: '', budget: '', start: '', end: '', status: 'Planning' });
  const [newEmp, setNewEmp] = useState({ fullName: '', password: '', doj: '' });
  const [resetPass, setResetPass] = useState({ username: '', newPass: '' });
  
  // Employee Forms
  const [reportForm, setReportForm] = useState({ projectId: '', activity: '', material: '', photoLink: '' });
  const [tokenForm, setTokenForm] = useState({ projectId: '', amount: '', reason: '' });

  // Theme
  const theme = {
    sidebar: '#1e293b', bg: '#f1f5f9', primary: '#f97316', text: '#334155', card: '#ffffff', border: '#e2e8f0'
  };

  // --- API ACTIONS ---
  async function handleLogin() {
    setLoading(true);
    try {
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
    } catch (e) { alert('Connection Error'); setLoading(false); }
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

  // --- ADMIN FUNCTIONS ---
  async function createProject() {
    await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'create_project', ...newProject }) });
    alert('✅ Project Created'); 
    setNewProject({ name: '', client: '', budget: '', start: '', end: '', status: 'Planning' }); // Reset Form
    loadAdminData(); setActiveTab('projects');
  }

  async function createEmployee() {
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'create_employee', ...newEmp }) });
    const data = await res.json();
    if (data.success) {
      alert(`✅ Employee Created!\n\nID: ${data.newId}\nPass: ${newEmp.password}`);
      setNewEmp({ fullName: '', password: '', doj: '' }); // Reset Form
      loadAdminData();
    }
  }

  async function resetPassword() {
    await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'reset_password', username: resetPass.username, newPassword: resetPass.newPass }) });
    alert('✅ Password Reset Successful'); loadAdminData();
  }

  async function handleToken(id, status, amount, projectId) {
    await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'update_token', tokenId: id, status, amount, projectId }) });
    loadAdminData();
  }

  // --- EMPLOYEE FUNCTIONS ---
  async function clockIn() {
    if (!navigator.geolocation) return alert('GPS Error');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'clock_in', username: user.username, lat: pos.coords.latitude, lng: pos.coords.longitude }) });
      alert('✅ Clocked In');
    });
  }
  async function submitReport() {
    await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'submit_report', username: user.username, ...reportForm }) });
    alert('✅ Report Submitted'); setReportForm({ projectId: '', activity: '', material: '', photoLink: '' });
  }
  async function raiseToken() {
    await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'raise_token', username: user.username, ...tokenForm }) });
    alert('✅ Request Sent'); setTokenForm({ projectId: '', amount: '', reason: '' }); loadEmployeeData();
  }

  // --- COMPONENTS ---
  const Badge = ({ status }) => {
    let color = '#64748b'; let bg = '#f1f5f9';
    if (status === 'Active' || status === 'Approved' || status === 'On Track') { color = '#16a34a'; bg = '#dcfce7'; }
    if (status === 'Pending' || status === 'Planning') { color = '#ca8a04'; bg = '#fef9c3'; }
    if (status === 'Rejected' || status === 'Issue') { color = '#dc2626'; bg = '#fee2e2'; }
    return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: color, background: bg }}>{status}</span>
  };

  // -------------------------------- VIEWS --------------------------------

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
          {/* SIDEBAR */}
          <div style={{ 
            width: '250px', background: theme.sidebar, color: 'white', padding: '20px', 
            display: sidebarOpen ? 'block' : 'none', 
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
          <style jsx>{` @media (min-width: 768px) { div[style*="display: none"] { display: block !important; position: static !important; } } `}</style>

          {/* CONTENT AREA */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            
            {/* 1. DASHBOARD */}
            {activeTab === 'dashboard' && (
               <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  <div style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>Active Projects: <br/><b style={{fontSize:'1.5rem'}}>{adminData.stats.active_projects}</b></div>
                  <div style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>Total Budget: <br/><b style={{fontSize:'1.5rem'}}>₹{(adminData.stats.total_budget/100000).toFixed(1)}L</b></div>
                  <div style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>Total Spent: <br/><b style={{fontSize:'1.5rem', color:theme.primary}}>₹{(adminData.stats.total_spent/100000).toFixed(1)}L</b></div>
               </div>
            )}

            {/* 2. PROJECTS (FIXED) */}
            {activeTab === 'projects' && (
               <div>
                  <div style={{background:'white', padding:'20px', borderRadius:'10px', marginBottom:'20px'}}>
                      <h3>➕ Create New Project</h3>
                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'10px'}}>
                         <input placeholder="Project Name" value={newProject.name} onChange={e=>setNewProject({...newProject, name:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}} />
                         <input placeholder="Client Name" value={newProject.client} onChange={e=>setNewProject({...newProject, client:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}} />
                         <input placeholder="Budget (₹)" value={newProject.budget} onChange={e=>setNewProject({...newProject, budget:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}} />
                         <select value={newProject.status} onChange={e=>setNewProject({...newProject, status:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}}>
                            <option value="Planning">Planning</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                         </select>
                         <input type="date" value={newProject.start} onChange={e=>setNewProject({...newProject, start:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}} />
                         <input type="date" value={newProject.end} onChange={e=>setNewProject({...newProject, end:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}} />
                      </div>
                      <button onClick={createProject} style={{marginTop:'15px', background:theme.primary, color:'white', padding:'10px 20px', border:'none', borderRadius:'5px', cursor:'pointer'}}>Save Project</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                   {adminData.projects.map(p => (
                      <div key={p.id} style={{ background: theme.card, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                         <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                            <h3 style={{margin:0}}>{p.project_name}</h3>
                            <Badge status={p.status} />
                         </div>
                         <div style={{color:'#64748b', fontSize:'0.9rem', marginBottom:'15px'}}>{p.client_name || 'No Client'}</div>
                         <div style={{marginBottom:'5px', fontSize:'0.8rem', display:'flex', justifyContent:'space-between'}}>
                            <span>Spent: ₹{p.budget_paid}</span>
                            <span>Budget: ₹{p.budget_total}</span>
                         </div>
                         <div style={{width:'100%', height:'8px', background:'#f1f5f9', borderRadius:'4px', overflow:'hidden'}}>
                            <div style={{width: `${(p.budget_paid/p.budget_total)*100}%`, height:'100%', background: theme.primary}}></div>
                         </div>
                      </div>
                   ))}
                  </div>
               </div>
            )}

            {/* 3. FINANCE (FIXED) */}
            {activeTab === 'finance' && (
                <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: `1px solid ${theme.border}` }}>
                         <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>By</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Reason</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Amount</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Action</th>
                         </tr>
                      </thead>
                      <tbody>
                         {adminData.tokens.map(t => (
                            <tr key={t.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                               <td style={{ padding: '15px' }}>{t.requested_by}</td>
                               <td style={{ padding: '15px' }}>{t.reason}</td>
                               <td style={{ padding: '15px', fontWeight: 'bold' }}>₹{t.amount}</td>
                               <td style={{ padding: '15px' }}><Badge status={t.status} /></td>
                               <td style={{ padding: '15px' }}>
                                  {t.status === 'Pending' && (
                                     <>
                                        <button onClick={()=>handleToken(t.id, 'Approved', t.amount, t.project_id)} style={{marginRight:'10px', background:'#22c55e', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>✓</button>
                                        <button onClick={()=>handleToken(t.id, 'Rejected', 0, 0)} style={{background:'#ef4444', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>✕</button>
                                     </>
                                  )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            )}

            {/* 4. REPORTS (FIXED) */}
            {activeTab === 'reports' && (
               <div style={{background:'white', padding:'20px', borderRadius:'10px'}}>
                  <h3>Daily Work Logs</h3>
                  {adminData.workLogs.length === 0 && <p>No logs yet.</p>}
                  {adminData.workLogs.map(log => (
                     <div key={log.id} style={{padding:'15px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <div>
                           <strong>{log.project_name}</strong> - {log.activity_description} <Badge status={log.status} />
                           <div style={{fontSize:'0.8rem', color:'#666'}}>{log.username} | {new Date(log.log_date).toLocaleDateString()} | Mat: {log.material_used}</div>
                        </div>
                        {log.photo_link && <a href={log.photo_link} target="_blank" style={{color:'blue', textDecoration:'underline'}}>View Photo</a>}
                     </div>
                  ))}
               </div>
            )}

            {/* 5. TEAM (FIXED with AUTO-ID) */}
            {activeTab === 'team' && (
               <div>
                  <div style={{background:'white', padding:'20px', borderRadius:'10px', marginBottom:'20px'}}>
                     <h3>➕ Hire New Employee</h3>
                     <p style={{fontSize:'0.9rem', color:'#666'}}>ID will be auto-generated (e.g. BISPLE01).</p>
                     <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'10px'}}>
                        <input placeholder="Full Name" value={newEmp.fullName} onChange={e=>setNewEmp({...newEmp, fullName:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}} />
                        <input placeholder="Assign Password" value={newEmp.password} onChange={e=>setNewEmp({...newEmp, password:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}} />
                        <input type="date" placeholder="Joining Date" value={newEmp.doj} onChange={e=>setNewEmp({...newEmp, doj:e.target.value})} style={{padding:'10px', border:'1px solid #ccc'}} />
                     </div>
                     <button onClick={createEmployee} style={{marginTop:'15px', background:'#22c55e', color:'white', padding:'10px 20px', border:'none', borderRadius:'5px', cursor:'pointer'}}>Create Account</button>
                  </div>

                  <div style={{background:'white', padding:'20px', borderRadius:'10px'}}>
                     <h3>Employee Directory</h3>
                     <div style={{marginBottom:'15px', padding:'10px', background:'#f8fafc', border:'1px solid #eee'}}>
                        <small>Reset Password:</small>
                        <select onChange={e=>setResetPass({...resetPass, username:e.target.value})} style={{padding:'5px', margin:'0 10px'}}>
                            <option>Select User</option>
                            {adminData.employees.map(e=><option key={e.username} value={e.username}>{e.full_name}</option>)}
                        </select>
                        <input placeholder="New Pass" onChange={e=>setResetPass({...resetPass, newPass:e.target.value})} style={{padding:'5px', width:'100px', marginRight:'10px'}} />
                        <button onClick={resetPassword} style={{padding:'5px 10px', background:'red', color:'white', border:'none'}}>Reset</button>
                     </div>

                     <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead><tr style={{background:'#eee', textAlign:'left'}}><th style={{padding:'10px'}}>Name</th><th>Employee ID</th><th>Joined</th></tr></thead>
                        <tbody>
                           {adminData.employees.map(e=>(
                              <tr key={e.username} style={{borderBottom:'1px solid #eee'}}>
                                 <td style={{padding:'10px'}}>{e.full_name}</td>
                                 <td style={{fontWeight:'bold'}}>{e.username}</td>
                                 <td>{new Date(e.date_of_joining).toLocaleDateString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // --- EMPLOYEE VIEW (UNCHANGED) ---
  if (view === 'employee' && empData) {
    return (
      <div style={{ fontFamily: 'sans-serif', background: '#0f172a', minHeight: '100vh', color: 'white', padding: '20px' }}>
         <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
            <h3>👷 {user.full_name}</h3>
            <button onClick={()=>setView('login')} style={{background:'red', color:'white', border:'none', padding:'5px 10px'}}>Logout</button>
         </div>
         <button onClick={clockIn} style={{width:'100%', padding:'20px', background:'#22c55e', color:'white', border:'none', borderRadius:'10px', fontSize:'1.2rem', fontWeight:'bold', marginBottom:'20px'}}>📍 GPS CLOCK IN</button>
         
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
