'use client';
import { useState, useEffect } from 'react';

export default function BitaERP() {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data Placeholders
  const [adminData, setAdminData] = useState(null);
  const [empData, setEmpData] = useState(null);

  // Forms
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newProject, setNewProject] = useState({ name: '', client: '', budget: '', start: '', end: '', status: 'Planning' });
  const [newEmp, setNewEmp] = useState({ fullName: '', password: '', doj: '' });
  
  // --- STYLING ---
  const colors = {
    primary: '#f97316', dark: '#0f172a', light: '#f1f5f9', white: '#ffffff',
    success: '#10b981', danger: '#ef4444', textMain: '#334155', textLight: '#94a3b8', border: '#e2e8f0'
  };

  const styles = {
    card: {
      background: 'white', borderRadius: '16px', padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.border}`
    },
    input: {
      width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${colors.border}`,
      background: '#f8fafc', marginBottom: '15px'
    },
    button: {
      width: '100%', padding: '14px', borderRadius: '10px', border: 'none',
      background: colors.primary, color: 'white', fontWeight: '600', cursor: 'pointer'
    },
    navItem: (active) => ({
      padding: '12px 16px', margin: '4px 0', borderRadius: '8px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '12px',
      background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
      color: active ? colors.primary : '#94a3b8', fontWeight: active ? '600' : '500'
    })
  };

  // --- 1. AUTO-LOGIN (THE FIX) ---
  useEffect(() => {
    // Check if user is saved in browser memory
    const savedUser = localStorage.getItem('bita_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Restore the correct view and fetch data immediately
      if (parsedUser.role === 'admin') {
        setView('admin');
        fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) })
          .then(r => r.json()).then(d => d.success && setAdminData(d));
      } else {
        setView('employee');
        fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'get_data', username: parsedUser.username }) })
          .then(r => r.json()).then(d => d.success && setEmpData(d));
      }
    }
  }, []); // Runs once when page loads

  // --- API CALLS ---
  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(loginForm) });
      const result = await res.json();
      setLoading(false);
      
      if (result.success) {
        // SAVE USER TO BROWSER MEMORY
        localStorage.setItem('bita_user', JSON.stringify(result.user));
        
        setUser(result.user);
        if (result.user.role === 'admin') { loadAdminData(); setView('admin'); }
        else { loadEmployeeData(result.user.username); setView('employee'); }
      } else { alert('❌ ' + result.message); }
    } catch(e) { setLoading(false); alert('System Error'); }
  }

  function handleLogout() {
    localStorage.removeItem('bita_user'); // Clear memory
    window.location.reload(); // Refresh to login screen
  }

  async function loadAdminData() {
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) });
    const result = await res.json();
    if(result.success) setAdminData(result);
  }

  async function loadEmployeeData(username) {
    const res = await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'get_data', username: username || user.username }) });
    const result = await res.json();
    if(result.success) setEmpData(result);
  }

  // --- WRAPPERS ---
  async function createProject() { await fetch('/api/admin', { method:'POST', body:JSON.stringify({action:'create_project', ...newProject})}); loadAdminData(); setActiveTab('projects'); alert('Project Created'); }
  async function createEmployee() { const res = await fetch('/api/admin', { method:'POST', body:JSON.stringify({action:'create_employee', ...newEmp})}); const data = await res.json(); if(data.success){ alert(`ID: ${data.newId}\nPass: ${newEmp.password}`); loadAdminData(); }}
  async function handleToken(id, st, amt, pid) { await fetch('/api/admin', {method:'POST', body:JSON.stringify({action:'update_token', tokenId:id, status:st, amount:amt, projectId:pid})}); loadAdminData(); }
  async function clockIn() { navigator.geolocation.getCurrentPosition(async(p)=>{ await fetch('/api/employee', {method:'POST', body:JSON.stringify({action:'clock_in', username:user.username, lat:p.coords.latitude, lng:p.coords.longitude})}); alert('✅ Clocked In'); }); }

  // --- SUB-COMPONENTS ---
  const StatusBadge = ({ status }) => {
    let bg = '#f1f5f9', col = '#64748b', dot = '#94a3b8';
    if(['Active', 'Approved', 'On Track'].includes(status)) { bg = '#dcfce7'; col = '#15803d'; dot = '#22c55e'; }
    if(['Pending', 'Planning'].includes(status)) { bg = '#fef9c3'; col = '#a16207'; dot = '#eab308'; }
    if(['Rejected', 'Issue'].includes(status)) { bg = '#fee2e2'; col = '#b91c1c'; dot = '#ef4444'; }
    return (
      <span style={{ background: bg, color: col, padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot }}></span> {status.toUpperCase()}
      </span>
    );
  };

  const StatBox = ({ label, val, sub, accent }) => (
    <div style={{ ...styles.card, borderLeft: `4px solid ${accent || colors.primary}`, position:'relative', overflow:'hidden' }}>
      <div style={{color: colors.textLight, fontSize: '0.85rem', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px'}}>{label}</div>
      <div style={{fontSize: '2rem', fontWeight: '800', color: colors.dark, margin: '10px 0'}}>{val}</div>
      <div style={{fontSize: '0.85rem', color: colors.textLight}}>{sub}</div>
      <div style={{position:'absolute', right:'-20px', top:'-20px', width:'100px', height:'100px', borderRadius:'50%', background:accent||colors.primary, opacity:'0.1'}}></div>
    </div>
  );

  // ---------------- VIEW: LOGIN ----------------
  if (view === 'login') {
    return (
      <div style={{ height: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{fontSize: '1.5rem', fontWeight: '900', color: colors.dark, letterSpacing: '-1px'}}>BITA INFRA</div>
            <div style={{color: colors.primary, fontSize: '0.9rem', fontWeight: '600', letterSpacing: '2px'}}>CONSTRUCTION OS</div>
          </div>
          <input placeholder="Username" value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username:e.target.value})} style={styles.input} />
          <input type="password" placeholder="Password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password:e.target.value})} style={styles.input} />
          <button onClick={handleLogin} disabled={loading} style={styles.button}>{loading ? 'Authenticating...' : 'Sign In'}</button>
          <div style={{textAlign:'center', marginTop:'20px', fontSize:'0.8rem', color:'#94a3b8'}}>Secure Enterprise Gateway</div>
        </div>
      </div>
    );
  }

  // ---------------- VIEW: ADMIN ----------------
  if (view === 'admin' && adminData) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>
        
        {/* DESKTOP SIDEBAR */}
        <div style={{ width: '260px', background: colors.dark, padding: '24px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', color: 'white', boxShadow: '4px 0 24px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '40px', paddingLeft: '10px' }}>
            <div style={{fontSize: '1.25rem', fontWeight: '800'}}>BITA <span style={{color:colors.primary}}>ERP</span></div>
            <div style={{fontSize: '0.75rem', opacity: 0.6}}>Admin Console v2.0</div>
          </div>
          <nav style={{flex: 1}}>
            {['Dashboard', 'Projects', 'Finance', 'Team', 'Reports'].map(item => (
              <div key={item} onClick={() => setActiveTab(item.toLowerCase())} style={styles.navItem(activeTab === item.toLowerCase())}>
                <span>{item==='Dashboard'?'📊':item==='Projects'?'🏗️':item==='Finance'?'💸':item==='Team'?'👷':item==='Reports'?'📝':''}</span> 
                {item}
              </div>
            ))}
          </nav>
          <div style={{borderTop: '1px solid #334155', paddingTop: '20px'}}>
            <div style={{fontSize:'0.9rem', fontWeight:'600'}}>{user.full_name}</div>
            <button onClick={handleLogout} style={{background:'none', border:'none', color:'#ef4444', fontSize:'0.8rem', cursor:'pointer', padding:0, marginTop:'5px'}}>Log Out</button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
            <h1 style={{fontSize:'1.75rem', fontWeight:'800', color:colors.dark, textTransform:'capitalize'}}>{activeTab}</h1>
            <div style={{background:'white', padding:'8px 16px', borderRadius:'30px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', fontSize:'0.9rem', fontWeight:'600', color:colors.primary}}>
              Today: {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div style={{display:'grid', gap:'24px'}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'24px'}}>
                <StatBox label="Active Projects" val={adminData.stats.active_projects} sub="Currently ongoing" accent="#3b82f6" />
                <StatBox label="Total Spent" val={`₹${(adminData.stats.total_spent/100000).toFixed(2)}L`} sub="Disbursed Funds" accent={colors.primary} />
                <StatBox label="Workforce" val={adminData.employees.length} sub="Registered Staff" accent="#10b981" />
              </div>

              <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px'}}>
                <div style={styles.card}>
                  <h3 style={{marginTop:0, marginBottom:'20px', color:colors.dark}}>Recent Site Updates</h3>
                  {adminData.workLogs.length === 0 && <div style={{textAlign:'center', padding:'20px', color:colors.textLight}}>No activity yet today.</div>}
                  {adminData.workLogs.map(log => (
                    <div key={log.id} style={{display:'flex', alignItems:'start', gap:'15px', paddingBottom:'15px', marginBottom:'15px', borderBottom:`1px solid ${colors.border}`}}>
                      <div style={{background:'#eff6ff', width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem'}}>🏗️</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:'600', color:colors.dark}}>{log.project_name}</div>
                        <div style={{color:colors.textMain, fontSize:'0.9rem', marginTop:'2px'}}>{log.activity_description}</div>
                        <div style={{fontSize:'0.75rem', color:colors.textLight, marginTop:'4px'}}>By {log.username} • {new Date(log.log_date).toLocaleDateString()}</div>
                      </div>
                      {log.photo_link && <a href={log.photo_link} target="_blank" style={{color:colors.primary, fontSize:'0.8rem', fontWeight:'600', textDecoration:'none'}}>View ↗</a>}
                    </div>
                  ))}
                </div>

                <div style={styles.card}>
                   <h3 style={{marginTop:0, marginBottom:'20px', color:colors.dark}}>Live Force 📍</h3>
                   {adminData.attendance.map(a => (
                     <div key={a.id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
                       <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                         <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 10px #22c55e'}}></div>
                         <div style={{fontWeight:'600', fontSize:'0.9rem'}}>{a.username}</div>
                       </div>
                       <div style={{fontSize:'0.8rem', color:colors.textLight}}>{new Date(a.clock_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div>
              <div style={{...styles.card, marginBottom:'30px'}}>
                <h3 style={{marginTop:0}}>Create New Project</h3>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'15px', marginBottom:'15px'}}>
                  <input placeholder="Project Name" value={newProject.name} onChange={e=>setNewProject({...newProject, name:e.target.value})} style={styles.input} />
                  <input placeholder="Client Name" value={newProject.client} onChange={e=>setNewProject({...newProject, client:e.target.value})} style={styles.input} />
                  <input placeholder="Budget (₹)" value={newProject.budget} onChange={e=>setNewProject({...newProject, budget:e.target.value})} style={styles.input} />
                  <input type="date" value={newProject.start} onChange={e=>setNewProject({...newProject, start:e.target.value})} style={styles.input} />
                  <input type="date" value={newProject.end} onChange={e=>setNewProject({...newProject, end:e.target.value})} style={styles.input} />
                  <select value={newProject.status} onChange={e=>setNewProject({...newProject, status:e.target.value})} style={styles.input}>
                    <option value="Planning">Planning</option> <option value="Active">Active</option>
                  </select>
                </div>
                <button onClick={createProject} style={{...styles.button, width:'auto', padding:'10px 30px'}}>+ Launch Project</button>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'24px'}}>
                {adminData.projects.map(p => (
                  <div key={p.id} style={styles.card}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'15px'}}>
                      <div>
                        <div style={{fontWeight:'700', fontSize:'1.1rem', color:colors.dark}}>{p.project_name}</div>
                        <div style={{fontSize:'0.85rem', color:colors.textLight}}>{p.client_name || 'Internal'}</div>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div style={{background:'#f1f5f9', height:'8px', borderRadius:'4px', overflow:'hidden', marginBottom:'8px'}}>
                      <div style={{width:`${(p.budget_paid/p.budget_total)*100}%`, background:colors.primary, height:'100%'}}></div>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.8rem', fontWeight:'600', color:colors.textMain}}>
                      <span>₹{(p.budget_paid/100000).toFixed(1)}L Spent</span>
                      <span>₹{(p.budget_total/100000).toFixed(1)}L Budget</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FINANCE TAB */}
          {activeTab === 'finance' && (
            <div style={styles.card}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'2px solid #f1f5f9', textAlign:'left', color:colors.textLight, fontSize:'0.85rem', textTransform:'uppercase'}}>
                    <th style={{padding:'15px'}}>Request ID</th>
                    <th style={{padding:'15px'}}>Employee</th>
                    <th style={{padding:'15px'}}>Reason</th>
                    <th style={{padding:'15px'}}>Amount</th>
                    <th style={{padding:'15px'}}>Status</th>
                    <th style={{padding:'15px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminData.tokens.map(t => (
                    <tr key={t.id} style={{borderBottom:'1px solid #f1f5f9'}}>
                      <td style={{padding:'15px', fontWeight:'600', color:colors.textLight}}>#TKN-{t.id}</td>
                      <td style={{padding:'15px', fontWeight:'600', color:colors.dark}}>{t.requested_by}</td>
                      <td style={{padding:'15px'}}>{t.reason}</td>
                      <td style={{padding:'15px', fontWeight:'700'}}>₹{t.amount}</td>
                      <td style={{padding:'15px'}}><StatusBadge status={t.status} /></td>
                      <td style={{padding:'15px'}}>
                        {t.status === 'Pending' && (
                          <div style={{display:'flex', gap:'8px'}}>
                            <button onClick={()=>handleToken(t.id, 'Approved', t.amount, t.project_id)} style={{background:'#dcfce7', color:'#15803d', border:'none', padding:'6px 12px', borderRadius:'6px', fontWeight:'600', cursor:'pointer'}}>Accept</button>
                            <button onClick={()=>handleToken(t.id, 'Rejected', 0, 0)} style={{background:'#fee2e2', color:'#b91c1c', border:'none', padding:'6px 12px', borderRadius:'6px', fontWeight:'600', cursor:'pointer'}}>Deny</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
             <div style={styles.card}>
                <h3>Add New Team Member (Auto ID)</h3>
                <div style={{display:'flex', gap:'15px', alignItems:'center', marginBottom:'20px'}}>
                   <input placeholder="Full Name" value={newEmp.fullName} onChange={e=>setNewEmp({...newEmp, fullName:e.target.value})} style={{...styles.input, marginBottom:0}} />
                   <input placeholder="Password" value={newEmp.password} onChange={e=>setNewEmp({...newEmp, password:e.target.value})} style={{...styles.input, marginBottom:0}} />
                   <input type="date" value={newEmp.doj} onChange={e=>setNewEmp({...newEmp, doj:e.target.value})} style={{...styles.input, marginBottom:0}} />
                   <button onClick={createEmployee} style={{...styles.button, width:'auto', padding:'14px 20px'}}>Hire Now</button>
                </div>
                <div style={{marginTop:'30px'}}>
                  <h4 style={{color:colors.textL
