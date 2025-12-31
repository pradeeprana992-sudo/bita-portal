'use client';
import { useState, useEffect } from 'react';

export default function BitaERP() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, projects, finance
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // Stores all dashboard data

  // --- FORMS ---
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newProject, setNewProject] = useState({ name: '', client: '', budget: '', start: '', end: '', status: 'Planning' });

  // --- STYLES (Professional Theme) ---
  const theme = {
    sidebar: '#1e293b', // Dark Slate
    bg: '#f8fafc', // Light Grey
    primary: '#f97316', // Orange
    text: '#334155', // Slate Grey
    card: '#ffffff',
    border: '#e2e8f0'
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
        alert("Employee Login Successful. (Please use Employee App)");
      }
    } else {
      alert('❌ ' + result.message);
    }
  }

  async function loadAdminData() {
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) });
    const result = await res.json();
    if (result.success) setData(result);
  }

  async function createProject() {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'create_project', ...newProject })
    });
    alert('Project Created');
    loadAdminData();
    setActiveTab('projects');
  }

  async function handleToken(id, status, amount, projectId) {
    await fetch('/api/admin', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_token', tokenId: id, status, amount, projectId })
    });
    loadAdminData();
  }

  // --- COMPONENTS ---

  const StatCard = ({ title, value, sub, color }) => (
    <div style={{ background: theme.card, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}`, flex: 1, minWidth: '200px' }}>
      <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '5px' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: color || theme.text }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sub}</div>
    </div>
  );

  const Badge = ({ status }) => {
    let color = '#64748b'; let bg = '#f1f5f9';
    if (status === 'Active' || status === 'Approved') { color = '#16a34a'; bg = '#dcfce7'; }
    if (status === 'Pending' || status === 'Planning') { color = '#ca8a04'; bg = '#fef9c3'; }
    if (status === 'Rejected' || status === 'Issue') { color = '#dc2626'; bg = '#fee2e2'; }
    return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: color, background: bg }}>{status}</span>
  };

  // --- VIEWS ---

  if (view === 'login') {
    return (
      <div style={{ height: '100vh', background: theme.sidebar, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', color: theme.sidebar, marginBottom: '30px' }}>BITA ERP <span style={{color: theme.primary}}>.</span></h2>
          <input placeholder="Username" value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'15px', borderRadius:'8px', border:'1px solid #ccc', background:'#f8fafc'}} />
          <input type="password" placeholder="Password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} style={{width:'100%', padding:'12px', marginBottom:'25px', borderRadius:'8px', border:'1px solid #ccc', background:'#f8fafc'}} />
          <button onClick={handleLogin} disabled={loading} style={{width:'100%', padding:'14px', background: theme.primary, color:'white', border:'none', borderRadius:'8px', fontSize:'1rem', fontWeight:'bold', cursor:'pointer'}}>
            {loading ? 'Accessing Secure Server...' : 'Login to Console'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'admin' && data) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', background: theme.bg }}>
        
        {/* SIDEBAR */}
        <div style={{ width: '250px', background: theme.sidebar, color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '40px', paddingLeft: '10px' }}>BITA <span style={{color:theme.primary}}>ADMIN</span></div>
          {['Dashboard', 'Projects', 'Finance', 'Team'].map(item => (
            <div 
              key={item} 
              onClick={() => setActiveTab(item.toLowerCase().replace(' ', ''))}
              style={{ 
                padding: '12px 15px', marginBottom: '5px', borderRadius: '8px', cursor: 'pointer', 
                background: activeTab === item.toLowerCase().replace(' ', '') ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === item.toLowerCase().replace(' ', '') ? theme.primary : '#94a3b8',
                fontWeight: activeTab === item.toLowerCase().replace(' ', '') ? 'bold' : 'normal'
              }}
            >
              {item}
            </div>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #334155' }}>
            <div style={{fontSize:'0.9rem'}}>{user.full_name}</div>
            <div style={{fontSize:'0.8rem', color:'#94a3b8', cursor:'pointer'}} onClick={()=>setView('login')}>Logout</div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ marginBottom: '20px', color: theme.text }}>Overview</h2>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                <StatCard title="Active Projects" value={data.stats.active_projects} sub={`Total: ${data.stats.total_projects}`} />
                <StatCard title="Total Budget" value={`₹${(data.stats.total_budget/100000).toFixed(1)} L`} sub="Approved Value" />
                <StatCard title="Actual Spent" value={`₹${(data.stats.total_spent/100000).toFixed(1)} L`} sub="Disbursed" color={theme.primary} />
                <StatCard title="Pending Requests" value={data.tokens.filter(t => t.status === 'Pending').length} sub="Needs Approval" color="#dc2626" />
              </div>

              {/* Recent Logs & Attendance */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div style={{ background: theme.card, padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                   <h3>📍 Live Force</h3>
                   {data.attendance.length === 0 ? <p style={{color:'#94a3b8'}}>No active check-ins.</p> : null}
                   {data.attendance.map(a => (
                     <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{a.username}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(a.clock_in_time).toLocaleTimeString()}</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: theme.primary }}>{a.location_name || 'GPS'}</div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS VIEW */}
          {activeTab === 'projects' && (
             <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                   <h2>Project Management</h2>
                   <button onClick={()=>setActiveTab('newproject')} style={{background:theme.sidebar, color:'white', padding:'10px 20px', borderRadius:'8px', border:'none', cursor:'pointer'}}>+ New Project</button>
                </div>

                {activeTab === 'newproject' && (
                   <div style={{background:theme.card, padding:'20px', marginBottom:'20px', borderRadius:'12px', border:`1px solid ${theme.border}`}}>
                      <h3>Create New Project</h3>
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                         <input placeholder="Project Name" onChange={e=>setNewProject({...newProject, name:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}} />
                         <input placeholder="Client Name" onChange={e=>setNewProject({...newProject, client:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}} />
                         <input placeholder="Total Budget (₹)" onChange={e=>setNewProject({...newProject, budget:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}} />
                         <select onChange={e=>setNewProject({...newProject, status:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}}>
                            <option value="Planning">Planning</option>
                            <option value="Active">Active</option>
                         </select>
                         <input type="date" placeholder="Start Date" onChange={e=>setNewProject({...newProject, start:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}} />
                         <input type="date" placeholder="End Date" onChange={e=>setNewProject({...newProject, end:e.target.value})} style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}} />
                      </div>
                      <button onClick={createProject} style={{marginTop:'15px', background:theme.primary, color:'white', padding:'10px 20px', border:'none', borderRadius:'5px', cursor:'pointer'}}>Save Project</button>
                   </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                   {data.projects.map(p => (
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

          {/* FINANCE VIEW */}
          {activeTab === 'finance' && (
             <div>
                <h2>Financial Approvals</h2>
                <div style={{ background: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: `1px solid ${theme.border}` }}>
                         <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Request By</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Reason</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Amount</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Action</th>
                         </tr>
                      </thead>
                      <tbody>
                         {data.tokens.map(t => (
                            <tr key={t.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                               <td style={{ padding: '15px' }}>{t.requested_by}</td>
                               <td style={{ padding: '15px' }}>{t.reason}</td>
                               <td style={{ padding: '15px', fontWeight: 'bold' }}>₹{t.amount}</td>
                               <td style={{ padding: '15px' }}><Badge status={t.status} /></td>
                               <td style={{ padding: '15px' }}>
                                  {t.status === 'Pending' && (
                                     <>
                                        <button onClick={()=>handleToken(t.id, 'Approved', t.amount, t.project_id)} style={{marginRight:'10px', background:'#22c55e', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Approve</button>
                                        <button onClick={()=>handleToken(t.id, 'Rejected', 0, 0)} style={{background:'#ef4444', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Reject</button>
                                     </>
                                  )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}>Loading Console...</div>;
}
