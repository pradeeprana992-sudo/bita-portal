'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, PieChart, Briefcase, Activity, DollarSign,
  MapPin, ArrowUpRight, LogOut, Check, X,
  ChevronLeft, Phone, Mail, UserPlus, FolderPlus, FileText
} from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [data, setData] = useState(null); // Stores Admin Data
  const [empData, setEmpData] = useState(null); // Stores Employee Data
  
  // Forms
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newProject, setNewProject] = useState({});
  const [newEmp, setNewEmp] = useState({});
  const [report, setReport] = useState({});
  const [fundReq, setFundReq] = useState({});

  // Styles
  const colors = { navy: '#0f172a', blue: '#2563eb', green: '#16a34a', orange: '#ea580c', bg: '#f8fafc', white: '#ffffff', border: '#e2e8f0', text: '#334155' };
  const styles = {
    container: { fontFamily: 'sans-serif', minHeight: '100vh', background: colors.bg, color: colors.text },
    card: { background: colors.white, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}`, marginBottom: '20px' },
    btn: { padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginBottom: '15px' }
  };

  // --- API CALLS ---
  
  async function handleLogin(e) {
    e.preventDefault();
    const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(loginForm) });
    const result = await res.json();
    if(result.success) {
      setUser(result.user);
      if(result.user.role === 'admin') loadAdminData();
      else loadEmployeeData();
    } else { alert('Invalid Login'); }
  }

  async function loadAdminData() {
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) });
    const d = await res.json();
    if(d.success) setData(d);
  }

  async function loadEmployeeData() {
    const res = await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'get_data' }) });
    const d = await res.json();
    if(d.success) setEmpData(d);
  }

  // Admin Actions
  async function createProject() { await fetch('/api/admin', { method:'POST', body:JSON.stringify({action:'create_project', ...newProject}) }); loadAdminData(); setCurrentView('dashboard'); alert('Project Created'); }
  async function hireStaff() { await fetch('/api/admin', { method:'POST', body:JSON.stringify({action:'create_employee', ...newEmp}) }); loadAdminData(); setCurrentView('dashboard'); alert('Staff Hired'); }
  async function handleFund(id, status) { await fetch('/api/admin', { method:'POST', body:JSON.stringify({action:'handle_request', id, status}) }); loadAdminData(); }

  // Employee Actions
  async function clockIn() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await fetch('/api/employee', { method:'POST', body:JSON.stringify({action:'clock_in', username:user.username, lat:pos.coords.latitude, lng:pos.coords.longitude}) });
      alert('✅ Clocked In Successfully');
    });
  }
  async function submitReport() { await fetch('/api/employee', { method:'POST', body:JSON.stringify({action:'submit_report', username:user.username, ...report}) }); alert('Report Submitted'); }
  async function requestFunds() { await fetch('/api/employee', { method:'POST', body:JSON.stringify({action:'request_funds', username:user.username, ...fundReq}) }); alert('Request Sent'); }

  // --- VIEWS ---

  // 1. LOGIN SCREEN
  if (!user) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
        <div style={{...styles.card, width: '90%', maxWidth: '400px', textAlign: 'center'}}>
          <h1 style={{color: colors.navy}}>BITA INFRA</h1>
          <input placeholder="Username (e.g. BIS001)" onChange={e=>setLoginForm({...loginForm, username:e.target.value})} style={styles.input} />
          <input type="password" placeholder="Password" onChange={e=>setLoginForm({...loginForm, password:e.target.value})} style={styles.input} />
          <button onClick={handleLogin} style={{...styles.btn, background: colors.blue, width: '100%'}}>Login</button>
        </div>
      </div>
    );
  }

  // 2. ADMIN DASHBOARD
  if (user.role === 'admin' && data) {
    return (
      <div style={{...styles.container, padding: '20px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
          <h2>Admin Command Center</h2>
          <button onClick={()=>setUser(null)} style={{...styles.btn, background: colors.navy, padding: '8px 15px'}}>Logout</button>
        </div>

        {currentView === 'dashboard' && (
          <>
            {/* STATS */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px'}}>
               <div style={styles.card}><h3>Revenue</h3><h2>₹{data.stats.revenue}</h2></div>
               <div style={styles.card}><h3>Active Projects</h3><h2>{data.stats.active}</h2></div>
               <div style={styles.card}><h3>Staff</h3><h2>{data.stats.staff}</h2></div>
            </div>

            {/* PENDING APPROVALS */}
            <h3>🔔 Pending Finance Approvals</h3>
            {data.requests.filter(r => r.status === 'Pending').length === 0 && <p>No pending requests.</p>}
            {data.requests.filter(r => r.status === 'Pending').map(r => (
               <div key={r.id} style={{...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <strong>{r.requested_by}</strong> needs <strong>₹{r.amount}</strong>
                    <div style={{fontSize: '0.9rem', color: '#666'}}>For: {r.reason} ({r.project_name})</div>
                  </div>
                  <div style={{display: 'flex', gap: '10px'}}>
                     <button onClick={()=>handleFund(r.id, 'Approved')} style={{...styles.btn, background: colors.green}}><Check size={18}/></button>
                     <button onClick={()=>handleFund(r.id, 'Rejected')} style={{...styles.btn, background: colors.orange}}><X size={18}/></button>
                  </div>
               </div>
            ))}

            {/* QUICK ACTIONS */}
            <h3>🚀 Quick Actions</h3>
            <div style={{display: 'flex', gap: '15px'}}>
               <button onClick={()=>setCurrentView('new_project')} style={{...styles.btn, background: colors.navy}}>+ New Project</button>
               <button onClick={()=>setCurrentView('new_staff')} style={{...styles.btn, background: colors.navy}}>+ Hire Staff</button>
            </div>
          </>
        )}

        {/* FORMS */}
        {currentView === 'new_project' && (
          <div style={styles.card}>
             <h3>Create New Project</h3>
             <input placeholder="Project Name" onChange={e=>setNewProject({...newProject, name:e.target.value})} style={styles.input} />
             <input placeholder="Client" onChange={e=>setNewProject({...newProject, client:e.target.value})} style={styles.input} />
             <input placeholder="Budget" onChange={e=>setNewProject({...newProject, value:e.target.value})} style={styles.input} />
             <button onClick={createProject} style={{...styles.btn, background: colors.green}}>Launch Project</button>
             <button onClick={()=>setCurrentView('dashboard')} style={{...styles.btn, background: '#666', marginLeft: '10px'}}>Cancel</button>
          </div>
        )}

        {currentView === 'new_staff' && (
          <div style={styles.card}>
             <h3>Hire New Employee</h3>
             <input placeholder="Full Name" onChange={e=>setNewEmp({...newEmp, fullName:e.target.value})} style={styles.input} />
             <input placeholder="Role" onChange={e=>setNewEmp({...newEmp, role:e.target.value})} style={styles.input} />
             <input placeholder="Phone" onChange={e=>setNewEmp({...newEmp, phone:e.target.value})} style={styles.input} />
             <input placeholder="Password" onChange={e=>setNewEmp({...newEmp, password:e.target.value})} style={styles.input} />
             <button onClick={hireStaff} style={{...styles.btn, background: colors.green}}>Create Account</button>
             <button onClick={()=>setCurrentView('dashboard')} style={{...styles.btn, background: '#666', marginLeft: '10px'}}>Cancel</button>
          </div>
        )}
      </div>
    );
  }

  // 3. EMPLOYEE MOBILE VIEW
  if (user.role !== 'admin' && empData) {
    return (
      <div style={{...styles.container, background: colors.navy, color: 'white', padding: '20px'}}>
         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
            <div>
               <div style={{fontSize: '0.8rem', opacity: 0.7}}>Welcome,</div>
               <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{user.full_name}</div>
            </div>
            <button onClick={()=>setUser(null)} style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%'}}><LogOut size={18}/></button>
         </div>

         {/* BIG CLOCK IN */}
         <button onClick={clockIn} style={{width: '100%', padding: '30px', borderRadius: '20px', background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none', color: 'white', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)'}}>
            <MapPin size={30}/>
            <div style={{textAlign: 'left'}}>
               <div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>GPS CLOCK IN</div>
               <div style={{fontSize: '0.8rem', opacity: 0.8}}>Mark Attendance</div>
            </div>
         </button>

         {/* REPORT FORM */}
         <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px', marginBottom: '20px'}}>
            <h3>📝 Daily Site Report</h3>
            <select onChange={e=>setReport({...report, projectId:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}}>
               <option>Select Project...</option>
               {empData.projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
            <input placeholder="What did you do today?" onChange={e=>setReport({...report, activity:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}} />
            <input placeholder="Materials Used" onChange={e=>setReport({...report, material:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}} />
            <button onClick={submitReport} style={{...styles.btn, background: colors.blue, width: '100%'}}>Submit Report</button>
         </div>

         {/* MONEY REQUEST */}
         <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px'}}>
            <h3>💸 Request Funds</h3>
            <select onChange={e=>setFundReq({...fundReq, projectId:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}}>
               <option>Select Project...</option>
               {empData.projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}
            </select>
            <input placeholder="Amount (₹)" onChange={e=>setFundReq({...fundReq, amount:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}} />
            <input placeholder="Reason" onChange={e=>setFundReq({...fundReq, reason:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}} />
            <button onClick={requestFunds} style={{...styles.btn, background: colors.orange, width: '100%'}}>Send Request</button>
         </div>
      </div>
    );
  }

  return <div>Loading System...</div>;
}
