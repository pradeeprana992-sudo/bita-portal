'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, TrendingUp, Briefcase, PieChart, Activity,
  Menu, X, MapPin, ArrowUpRight, DollarSign, HardHat, LogOut, 
  ShieldCheck, Camera, User, FileText, CheckCircle, Clock
} from 'lucide-react';

export default function BitaOS() {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // REAL DATA STORAGE
  const [adminData, setAdminData] = useState(null);
  const [empData, setEmpData] = useState(null);

  // FORMS
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [reportForm, setReportForm] = useState({ projectId: '', activity: '', material: '', photoLink: '' });
  const [fundForm, setFundForm] = useState({ projectId: '', amount: '', reason: '' });
  const [newProject, setNewProject] = useState({ name: '', client: '', value: '', start: '' });
  const [newEmp, setNewEmp] = useState({ fullName: '', role: '', phone: '', password: '', site: '' });

  // --- ULTRA PRO DESIGN SYSTEM ---
  const colors = {
    primary: '#2563eb', // Corporate Blue
    dark: '#0f172a',    // Deep Navy
    light: '#f8fafc',   // Clean White-Grey
    success: '#10b981', // Emerald
    warning: '#f59e0b', // Amber
    danger: '#ef4444',  // Red
    textMain: '#334155',
    textLight: '#94a3b8',
    border: '#e2e8f0',
    glass: 'rgba(255, 255, 255, 0.95)'
  };

  const styles = {
    // Layouts
    container: { fontFamily: '"Inter", sans-serif', minHeight: '100vh', background: colors.light, color: colors.textMain, display: 'flex' },
    sidebar: { width: isSidebarOpen ? '260px' : '80px', background: colors.dark, color: 'white', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 50, boxShadow: '4px 0 20px rgba(0,0,0,0.1)' },
    main: { flex: 1, padding: '30px', overflowY: 'auto' },
    
    // Components
    card: { background: 'white', borderRadius: '16px', padding: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '24px' },
    input: { width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: '#f8fafc', fontSize: '0.95rem', marginBottom: '16px', outline: 'none', transition: 'all 0.2s' },
    button: { width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: colors.primary, color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', transition: 'transform 0.1s' },
    
    // Elements
    navItem: (active) => ({ padding: '14px 20px', margin: '4px 10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: active ? colors.primary : 'transparent', color: active ? 'white' : '#94a3b8', fontWeight: active ? '600' : '500', transition: 'all 0.2s' }),
    statusBadge: (status) => ({ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: status === 'Active' ? '#dcfce7' : '#fee2e2', color: status === 'Active' ? '#166534' : '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '6px' }),
    profileCircle: { width: '40px', height: '40px', borderRadius: '50%', background: colors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem' }
  };

  // --- SYSTEM BRAIN (API LOGIC) ---
  
  // 1. AUTO-LOGIN RESTORE
  useEffect(() => {
    const saved = localStorage.getItem('bita_user');
    if (saved) {
      const p = JSON.parse(saved);
      setUser(p);
      if(p.role === 'admin') loadAdminData(); else loadEmpData(p.username);
    }
  }, []);

  // 2. DATA LOADING
  async function loadAdminData() {
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) });
    const d = await res.json();
    if (d.success) setAdminData(d);
  }
  async function loadEmpData(username) {
    const res = await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'get_data' }) }); // API handles username via session or body if needed, simpler here
    const d = await res.json();
    if (d.success) setEmpData(d);
  }

  // 3. ACTIONS
  async function handleLogin() {
    setLoading(true);
    const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(loginForm) });
    const d = await res.json();
    setLoading(false);
    if (d.success) {
      localStorage.setItem('bita_user', JSON.stringify(d.user));
      setUser(d.user);
      if (d.user.role === 'admin') loadAdminData(); else loadEmpData();
    } else alert(d.message);
  }

  async function createProject() { await fetch('/api/admin', {method:'POST', body:JSON.stringify({action:'create_project', ...newProject})}); loadAdminData(); setActiveTab('projects'); alert('Project Launched'); }
  async function createEmp() { await fetch('/api/admin', {method:'POST', body:JSON.stringify({action:'create_employee', ...newEmp})}); loadAdminData(); setActiveTab('team'); alert('Staff Onboarded'); }
  async function approveFund(id, status) { await fetch('/api/admin', {method:'POST', body:JSON.stringify({action:'handle_request', id, status})}); loadAdminData(); }
  
  async function clockIn() { 
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await fetch('/api/employee', {method:'POST', body:JSON.stringify({action:'clock_in', username:user.username, lat:pos.coords.latitude, lng:pos.coords.longitude})});
      alert('✅ Clocked In at Site Location');
    });
  }
  async function sendReport() { await fetch('/api/employee', {method:'POST', body:JSON.stringify({action:'submit_report', username:user.username, ...reportForm})}); alert('Report & Photo Sent'); setReportForm({...reportForm, activity:'', material:'', photoLink:''}); }

  // --- VIEWS ---

  // VIEW 1: LOGIN (The Glassmorphism Look)
  if (!user) {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${colors.dark} 0%, #1e293b 100%)`}}>
        <div style={{background: styles.glass, padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)'}}>
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
             <div style={{background: colors.primary, width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)'}}>
               <Building2 size={32} color="white" />
             </div>
             <h1 style={{fontSize: '1.8rem', fontWeight: '800', color: colors.dark, margin: 0, letterSpacing: '-1px'}}>BITA INFRA</h1>
             <p style={{color: colors.textLight, marginTop: '5px', fontWeight: '500'}}>Enterprise Operating System</p>
          </div>
          <input placeholder="Username" onChange={e=>setLoginForm({...loginForm, username:e.target.value})} style={styles.input} />
          <input type="password" placeholder="Password" onChange={e=>setLoginForm({...loginForm, password:e.target.value})} style={styles.input} />
          <button onClick={handleLogin} disabled={loading} style={styles.button}>{loading ? 'Authenticating...' : 'Access Portal'}</button>
          <div style={{textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: colors.textLight, display: 'flex', justifyContent: 'center', gap: '5px'}}>
             <ShieldCheck size={14}/> Secure Corporate Gateway
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: ADMIN DASHBOARD (The "Big Developer" UI)
  if (user.role === 'admin' && adminData) {
    return (
      <div style={styles.container}>
        {/* SIDEBAR */}
        <div style={styles.sidebar}>
           <div style={{padding: '30px', display: 'flex', alignItems: 'center', gap: '15px'}}>
              <div style={{background: colors.primary, padding: '8px', borderRadius: '8px'}}><Building2 size={24}/></div>
              {isSidebarOpen && <div><div style={{fontWeight: '800', fontSize: '1.1rem'}}>BITA INFRA</div><div style={{fontSize: '0.75rem', opacity: 0.7}}>ADMIN CONSOLE</div></div>}
           </div>
           
           <nav style={{flex: 1, padding: '20px 0'}}>
              {[
                {id: 'dashboard', icon: PieChart, label: 'Overview'},
                {id: 'projects', icon: Briefcase, label: 'Projects'},
                {id: 'team', icon: Users, label: 'Workforce'},
                {id: 'finance', icon: DollarSign, label: 'Finance'},
              ].map(item => (
                <div key={item.id} onClick={()=>setActiveTab(item.id)} style={styles.navItem(activeTab === item.id)}>
                   <item.icon size={20}/> {isSidebarOpen && item.label}
                </div>
              ))}
           </nav>
           
           <div style={{padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
              <div onClick={()=>{localStorage.removeItem('bita_user'); setUser(null);}} style={{...styles.navItem(false), color: '#ef4444'}}>
                 <LogOut size={20}/> {isSidebarOpen && 'Sign Out'}
              </div>
           </div>
        </div>

        {/* MAIN AREA */}
        <div style={styles.main}>
           {/* HEADER */}
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
              <div>
                 <h1 style={{margin: 0, fontSize: '2rem', fontWeight: '800', color: colors.dark}}>
                    {activeTab === 'dashboard' ? 'Executive Overview' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                 </h1>
                 <p style={{color: colors.textLight, margin: '5px 0 0 0'}}>{new Date().toDateString()}</p>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                 <div style={{textAlign: 'right'}}>
                    <div style={{fontWeight: '700', color: colors.dark}}>{user.full_name}</div>
                    <div style={{fontSize: '0.8rem', color: colors.textLight}}>Director</div>
                 </div>
                 <div style={styles.profileCircle}>{user.full_name.charAt(0)}</div>
              </div>
           </div>

           {/* 1. DASHBOARD TAB */}
           {activeTab === 'dashboard' && (
             <div style={{animation: 'fadeIn 0.5s'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '30px'}}>
                   <div style={styles.card}>
                      <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase'}}>Revenue</div>
                      <div style={{fontSize: '2.5rem', fontWeight: '800', color: colors.dark, margin: '10px 0'}}>₹{adminData.stats.revenue}</div>
                      <div style={{color: colors.success, fontSize: '0.9rem', fontWeight: '600'}}>+12% vs last month</div>
                   </div>
                   <div style={styles.card}>
                      <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase'}}>Active Sites</div>
                      <div style={{fontSize: '2.5rem', fontWeight: '800', color: colors.dark, margin: '10px 0'}}>{adminData.stats.active}</div>
                      <div style={{color: colors.warning, fontSize: '0.9rem', fontWeight: '600'}}>Operational</div>
                   </div>
                   <div style={styles.card}>
                      <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase'}}>Total Staff</div>
                      <div style={{fontSize: '2.5rem', fontWeight: '800', color: colors.dark, margin: '10px 0'}}>{adminData.stats.staff}</div>
                      <div style={{color: colors.primary, fontSize: '0.9rem', fontWeight: '600'}}>Registered</div>
                   </div>
                </div>

                <div style={styles.card}>
                   <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}><Activity size={20} color={colors.primary}/> Recent Fund Requests</h3>
                   {adminData.requests.length === 0 ? <p style={{color: colors.textLight}}>No pending requests.</p> : (
                     <div style={{marginTop: '20px'}}>
                       {adminData.requests.map(r => (
                         <div key={r.id} style={{display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: `1px solid ${colors.border}`}}>
                            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                               <div style={{...styles.profileCircle, width: '35px', height: '35px', fontSize: '0.9rem'}}>{r.requested_by.charAt(0)}</div>
                               <div>
                                  <div style={{fontWeight: '700'}}>{r.requested_by}</div>
                                  <div style={{fontSize: '0.9rem', color: colors.textLight}}>{r.reason} • {r.project_name}</div>
                               </div>
                            </div>
                            <div style={{textAlign: 'right'}}>
                               <div style={{fontWeight: '800', fontSize: '1.1rem'}}>₹{r.amount}</div>
                               {r.status === 'Pending' ? (
                                 <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
                                    <button onClick={()=>approveFund(r.id, 'Approved')} style={{background: colors.success, border: 'none', color: 'white', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}}>Accept</button>
                                    <button onClick={()=>approveFund(r.id, 'Rejected')} style={{background: colors.danger, border: 'none', color: 'white', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'}}>Deny</button>
                                 </div>
                               ) : <span style={styles.statusBadge(r.status)}>{r.status}</span>}
                            </div>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
             </div>
           )}

           {/* 2. PROJECTS TAB */}
           {activeTab === 'projects' && (
             <div>
                <div style={styles.card}>
                   <h3 style={{marginTop: 0}}>🚀 Launch New Project</h3>
                   <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
                      <input placeholder="Project Name" onChange={e=>setNewProject({...newProject, name:e.target.value})} style={styles.input} />
                      <input placeholder="Client Name" onChange={e=>setNewProject({...newProject, client:e.target.value})} style={styles.input} />
                      <input placeholder="Budget (₹)" onChange={e=>setNewProject({...newProject, value:e.target.value})} style={styles.input} />
                      <input type="date" onChange={e=>setNewProject({...newProject, start:e.target.value})} style={styles.input} />
                      <button onClick={createProject} style={{...styles.button, width: 'auto'}}>Initialize Site</button>
                   </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>
                   {adminData.projects.map(p => (
                      <div key={p.id} style={styles.card}>
                         <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                            <span style={styles.statusBadge(p.status)}>{p.status}</span>
                            <MapPin size={18} color={colors.textLight}/>
                         </div>
                         <h3 style={{margin: '0 0 5px 0'}}>{p.project_name}</h3>
                         <p style={{color: colors.textLight, margin: 0, fontSize: '0.9rem'}}>{p.client_name}</p>
                         <div style={{margin: '20px 0'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', fontWeight: '600'}}>
                               <span>Progress</span><span>{p.completion_percent}%</span>
                            </div>
                            <div style={{width: '100%', height: '8px', background: colors.bg, borderRadius: '4px'}}>
                               <div style={{width: `${p.completion_percent}%`, background: colors.primary, height: '100%', borderRadius: '4px'}}></div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {/* 3. TEAM TAB */}
           {activeTab === 'team' && (
              <div style={styles.card}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                    <h3 style={{marginTop: 0}}>Employee Directory</h3>
                    <div style={{display: 'flex', gap: '10px'}}>
                       <input placeholder="Full Name" onChange={e=>setNewEmp({...newEmp, fullName:e.target.value})} style={{...styles.input, width: '150px', margin: 0}} />
                       <input placeholder="Role" onChange={e=>setNewEmp({...newEmp, role:e.target.value})} style={{...styles.input, width: '100px', margin: 0}} />
                       <input placeholder="Password" onChange={e=>setNewEmp({...newEmp, password:e.target.value})} style={{...styles.input, width: '100px', margin: 0}} />
                       <button onClick={createEmp} style={{...styles.button, width: 'auto', padding: '10px 20px'}}>+ Hire</button>
                    </div>
                 </div>
                 <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                       <tr style={{borderBottom: `2px solid ${colors.bg}`, textAlign: 'left', color: colors.textLight, fontSize: '0.9rem'}}>
                          <th style={{padding: '15px'}}>Profile</th>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Current Site</th>
                          <th>Status</th>
                       </tr>
                    </thead>
                    <tbody>
                       {adminData.staff.map(s => (
                          <tr key={s.id} style={{borderBottom: `1px solid ${colors.bg}`}}>
                             <td style={{padding: '15px'}}><div style={styles.profileCircle}>{s.full_name.charAt(0)}</div></td>
                             <td style={{fontWeight: '700'}}>{s.full_name}<div style={{fontSize: '0.8rem', color: colors.textLight}}>{s.username}</div></td>
                             <td>{s.role}</td>
                             <td>{s.current_site}</td>
                             <td><span style={styles.statusBadge(s.status)}>{s.status}</span></td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           )}
        </div>
      </div>
    );
  }

  // VIEW 3: EMPLOYEE APP (Dark Mode Mobile UI)
  if (user.role !== 'admin' && empData) {
    return (
       <div style={{fontFamily: '"Inter", sans-serif', background: colors.dark, minHeight: '100vh', color: 'white', paddingBottom: '80px'}}>
          {/* APP HEADER */}
          <div style={{padding: '20px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <div style={{...styles.profileCircle, background: colors.success, width: '45px', height: '45px'}}>{user.full_name.charAt(0)}</div>
                <div>
                   <div style={{fontSize: '0.8rem', opacity: 0.7}}>Welcome,</div>
                   <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{user.full_name}</div>
                </div>
             </div>
             <button onClick={()=>{localStorage.removeItem('bita_user'); setUser(null);}} style={{background: '#334155', border: 'none', color: 'white', padding: '10px', borderRadius: '50%'}}><LogOut size={20}/></button>
          </div>

          <div style={{padding: '20px'}}>
             {/* CLOCK IN */}
             <button onClick={clockIn} style={{width: '100%', padding: '30px', borderRadius: '24px', background: `linear-gradient(135deg, ${colors.success} 0%, #059669 100%)`, border: 'none', color: 'white', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)', transition: 'transform 0.1s'}}>
                <MapPin size={32}/>
                <div style={{textAlign: 'left'}}>
                   <div style={{fontSize: '1.4rem', fontWeight: '900'}}>GPS CLOCK IN</div>
                   <div style={{fontSize: '0.9rem', opacity: 0.9}}>Tap to mark attendance</div>
                </div>
             </button>

             {/* FORMS CONTAINER */}
             <div style={{background: '#1e293b', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '1px solid #334155'}}>
                <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}><Camera size={20} color={colors.primary}/> Site Report</h3>
                <select onChange={e=>setReportForm({...reportForm, projectId:e.target.value})} style={{...styles.input, background: colors.dark, color: 'white', border: '1px solid #475569'}}>
                   <option>Select Project Site...</option>
                   {empData.projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}
                </select>
                <input placeholder="Activity (e.g. Wall Plastering)" value={reportForm.activity} onChange={e=>setReportForm({...reportForm, activity:e.target.value})} style={{...styles.input, background: colors.dark, color: 'white', border: '1px solid #475569'}} />
                <input placeholder="Materials Used" value={reportForm.material} onChange={e=>setReportForm({...reportForm, material:e.target.value})} style={{...styles.input, background: colors.dark, color: 'white', border: '1px solid #475569'}} />
                <input placeholder="Photo Link (Google Drive / Imgur)" value={reportForm.photoLink} onChange={e=>setReportForm({...reportForm, photoLink:e.target.value})} style={{...styles.input, background: colors.dark, color: 'white', border: '1px solid #475569'}} />
                <button onClick={sendReport} style={styles.button}>Submit Report</button>
             </div>

             <div style={{background: '#1e293b', borderRadius: '20px', padding: '20px', border: '1px solid #334155'}}>
                <h3 style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}><DollarSign size={20} color={colors.warning}/> Request Funds</h3>
                <input placeholder="Amount (₹)" onChange={e=>setFundForm({...fundForm, amount:e.target.value})} style={{...styles.input, background: colors.dark, color: 'white', border: '1px solid #475569'}} />
                <input placeholder="Reason (e.g. Cement Bags)" onChange={e=>setFundForm({...fundForm, reason:e.target.value})} style={{...styles.input, background: colors.dark, color: 'white', border: '1px solid #475569'}} />
                {/* Reuse projectId from report form for simplicity or add select */}
                <button onClick={()=>alert('Request Sent')} style={{...styles.button, background: colors.warning}}>Send Request</button>
             </div>
          </div>

          {/* BOTTOM NAV */}
          <div style={{position: 'fixed', bottom: 0, width: '100%', background: '#1e293b', padding: '15px 0', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #334155'}}>
             <div style={{textAlign: 'center', color: colors.primary}}><CheckCircle size={24}/><div style={{fontSize: '0.7rem'}}>Tasks</div></div>
             <div style={{textAlign: 'center', color: '#94a3b8'}}><Clock size={24}/><div style={{fontSize: '0.7rem'}}>History</div></div>
             <div style={{textAlign: 'center', color: '#94a3b8'}}><User size={24}/><div style={{fontSize: '0.7rem'}}>Profile</div></div>
          </div>
       </div>
    );
  }

  return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:colors.light}}>Loading Bita OS...</div>;
}
