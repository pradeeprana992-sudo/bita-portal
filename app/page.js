'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, PieChart, Briefcase, Activity, DollarSign,
  MapPin, LogOut, Check, X, Trash2, RefreshCw, Package, HardHat,
  ChevronLeft, Phone, Mail, UserPlus, FolderPlus, Camera, Save, 
  FileText, TrendingUp, PenTool
} from 'lucide-react';

export default function BitaOS() {
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState(null); // The Project Hub Focus
  const [data, setData] = useState(null); 
  const [empData, setEmpData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Forms
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [newProject, setNewProject] = useState({});
  const [newEmp, setNewEmp] = useState({});
  const [forms, setForms] = useState({}); // Generic form handler

  // Styles
  const colors = { navy: '#0f172a', blue: '#2563eb', green: '#16a34a', orange: '#ea580c', red: '#dc2626', bg: '#f8fafc', white: '#ffffff', border: '#e2e8f0', text: '#334155' };
  const styles = {
    container: { fontFamily: 'sans-serif', minHeight: '100vh', background: colors.bg, color: colors.text },
    card: { background: colors.white, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}`, marginBottom: '20px' },
    btn: { padding: '10px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginBottom: '15px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { textAlign: 'left', padding: '10px', borderBottom: `2px solid ${colors.bg}`, color: '#64748b', fontSize: '0.9rem' },
    td: { padding: '10px', borderBottom: `1px solid ${colors.bg}` }
  };

  // --- ACTIONS ---
  async function handleLogin(e) { e.preventDefault(); const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(loginForm) }); const d = await res.json(); if(d.success) { localStorage.setItem('bita_user', JSON.stringify(d.user)); setUser(d.user); if(d.user.role === 'admin') loadAdminData(); else loadEmployeeData(); } else alert('Invalid'); }
  async function loadAdminData() { const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) }); const d = await res.json(); if(d.success) setData(d); }
  async function loadEmployeeData() { const res = await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'get_data' }) }); const d = await res.json(); if(d.success) setEmpData(d); }

  // Generic Submit Wrapper
  async function submitAction(action, extraData = {}) {
    await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action, ...forms, ...extraData }) });
    alert('Success'); loadAdminData(); setForms({});
  }

  // --- VIEWS ---
  if (!user) return (
    <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
      <div style={{...styles.card, width: '90%', maxWidth: '400px', textAlign: 'center'}}>
        <h1 style={{color: colors.navy}}>BITA INFRA</h1><p style={{color:'#64748b'}}>Management OS</p>
        <input placeholder="Username" onChange={e=>setLoginForm({...loginForm, username:e.target.value})} style={styles.input} />
        <input type="password" placeholder="Password" onChange={e=>setLoginForm({...loginForm, password:e.target.value})} style={styles.input} />
        <button onClick={handleLogin} style={{...styles.btn, background: colors.blue, width: '100%', justifyContent:'center'}}>Login</button>
      </div>
    </div>
  );

  // ADMIN VIEW
  if (user.role === 'admin' && data) {
    return (
      <div style={{...styles.container, display: 'flex'}}>
        {/* SIDEBAR */}
        <div style={{width: isSidebarOpen ? '260px' : '70px', background: colors.navy, color: 'white', padding: '20px', transition: 'width 0.3s'}}>
           <div style={{marginBottom: '30px', display: 'flex', gap: '10px', alignItems: 'center'}}><Building2 size={24} color={colors.blue}/> {isSidebarOpen && <span style={{fontWeight: 'bold'}}>BITA ERP</span>}</div>
           {[
             {id: 'dashboard', icon: PieChart, label: 'Overview'},
             {id: 'projects', icon: Briefcase, label: 'Projects'},
             {id: 'finance', icon: TrendingUp, label: 'Investments'}, // NEW
             {id: 'assets', icon: PenTool, label: 'Asset Register'}, // NEW
             {id: 'team', icon: Users, label: 'Staff'},
           ].map(item => (
             <div key={item.id} onClick={()=>{setCurrentView(item.id); setSelectedProject(null);}} style={{padding: '12px', cursor: 'pointer', display: 'flex', gap: '15px', color: currentView === item.id ? colors.blue : '#94a3b8'}}>
                <item.icon size={20}/> {isSidebarOpen && item.label}
             </div>
           ))}
           <div style={{marginTop: '50px', borderTop: '1px solid #333', paddingTop: '20px'}}>
              <button onClick={()=>{localStorage.removeItem('bita_user'); setUser(null);}} style={{background:'none', border:'none', color: colors.red, display:'flex', gap:'10px', cursor:'pointer'}}><LogOut size={20}/> {isSidebarOpen && 'Logout'}</button>
           </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex: 1, padding: '30px', overflowY: 'auto'}}>
           
           {/* 1. PROJECT HUB (DEEP DIVE VIEW) */}
           {currentView === 'project_hub' && selectedProject ? (
             <div>
                <button onClick={()=>setCurrentView('projects')} style={{background:'none', border:'none', color:colors.blue, display:'flex', alignItems:'center', marginBottom:'20px', cursor:'pointer'}}><ChevronLeft size={20}/> Back to Projects</button>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                   <div><h1 style={{margin:0}}>{selectedProject.project_name}</h1><p style={{color:'#64748b'}}>Client: {selectedProject.client_name} | Budget: ₹{selectedProject.budget_total}</p></div>
                   <div style={{textAlign:'right'}}><span style={{background: selectedProject.status==='Active'?'#dcfce7':'#f1f5f9', color: selectedProject.status==='Active'?'#16a34a':'#64748b', padding:'5px 10px', borderRadius:'20px', fontWeight:'bold', fontSize:'0.8rem'}}>{selectedProject.status}</span></div>
                </div>

                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px'}}>
                   {/* INVENTORY CARD */}
                   <div style={styles.card}>
                      <h3>📦 Site Store</h3>
                      {data.inventory.filter(i => i.project_id === selectedProject.id).length === 0 && <p>No stock.</p>}
                      <table style={styles.table}><tbody>{data.inventory.filter(i => i.project_id === selectedProject.id).map(i => <tr key={i.id}><td style={styles.td}>{i.item_name}</td><td style={{...styles.td, fontWeight:'bold'}}>{i.quantity} {i.unit}</td></tr>)}</tbody></table>
                      <div style={{marginTop:'10px', borderTop:'1px solid #eee', paddingTop:'10px'}}>
                         <small>Add Stock:</small>
                         <div style={{display:'flex', gap:'5px', marginTop:'5px'}}><input placeholder="Item" onChange={e=>setForms({...forms, item:e.target.value})} style={{...styles.input, marginBottom:0}} /><input placeholder="Qty" onChange={e=>setForms({...forms, qty:e.target.value, unit:'Units', refNo:'Direct', type:'IN'})} style={{...styles.input, marginBottom:0, width:'60px'}} /><button onClick={()=>submitAction('add_material', {projectId: selectedProject.id})} style={{...styles.btn, background: colors.blue}}>+</button></div>
                      </div>
                   </div>

                   {/* FILES CARD */}
                   <div style={styles.card}>
                      <h3>📂 Digital Files</h3>
                      {data.documents.filter(d => d.project_id === selectedProject.id).length === 0 && <p>No files.</p>}
                      {data.documents.filter(d => d.project_id === selectedProject.id).map(d => (
                         <div key={d.id} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #eee'}}>
                            <span>{d.doc_name} <small style={{color:'#64748b'}}>({d.category})</small></span>
                            <a href={d.file_link} target="_blank" style={{color:colors.blue}}>View</a>
                         </div>
                      ))}
                      <div style={{marginTop:'10px', borderTop:'1px solid #eee', paddingTop:'10px'}}>
                         <small>Link New File:</small>
                         <div style={{display:'flex', gap:'5px', marginTop:'5px'}}><input placeholder="Doc Name" onChange={e=>setForms({...forms, name:e.target.value, category:'General'})} style={{...styles.input, marginBottom:0}} /><input placeholder="URL" onChange={e=>setForms({...forms, link:e.target.value})} style={{...styles.input, marginBottom:0}} /><button onClick={()=>submitAction('add_document', {projectId: selectedProject.id})} style={{...styles.btn, background: colors.blue}}>+</button></div>
                      </div>
                   </div>

                   {/* LABOR CARD */}
                   <div style={styles.card}>
                      <h3>👷 Daily Labor Log</h3>
                      <table style={styles.table}><thead><tr><th style={styles.th}>Date</th><th style={styles.th}>Mason</th><th style={styles.th}>Helper</th></tr></thead>
                      <tbody>{data.labor.filter(l => l.project_id === selectedProject.id).map(l => <tr key={l.id}><td style={styles.td}>{new Date(l.date).toLocaleDateString()}</td><td style={styles.td}>{l.mason_count}</td><td style={styles.td}>{l.helper_count}</td></tr>)}</tbody></table>
                   </div>
                </div>
             </div>
           ) : (
             <>
               {/* 2. MAIN DASHBOARD OVERVIEW */}
               {currentView === 'dashboard' && (
                 <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                    <div style={styles.card}><h3>Capital Raised</h3><h2>₹{data.stats.revenue}</h2></div>
                    <div style={styles.card}><h3>Total Expenses</h3><h2>₹{data.stats.expense}</h2></div>
                    <div style={styles.card}><h3>Projects</h3><h2>{data.stats.active} Active</h2></div>
                    <div style={{gridColumn:'1/-1', ...styles.card}}>
                       <h3>Recent Investments</h3>
                       <table style={styles.table}><thead><tr><th style={styles.th}>Investor</th><th style={styles.th}>Project</th><th style={styles.th}>Date</th><th style={styles.th}>Amount</th></tr></thead>
                       <tbody>{data.investments.slice(0,5).map(i => <tr key={i.id}><td style={styles.td}>{i.investor_name}</td><td style={styles.td}>{i.project_name}</td><td style={styles.td}>{new Date(i.transaction_date).toLocaleDateString()}</td><td style={{...styles.td, color:colors.green, fontWeight:'bold'}}>₹{i.amount}</td></tr>)}</tbody></table>
                    </div>
                 </div>
               )}

               {/* 3. PROJECTS LIST (THE GATEWAY TO HUB) */}
               {currentView === 'projects' && (
                 <div>
                    <div style={{...styles.card, display:'flex', gap:'10px', alignItems:'center'}}>
                       <h3>Add Project:</h3>
                       <input placeholder="Name" onChange={e=>setNewProject({...newProject, name:e.target.value})} style={{...styles.input, marginBottom:0}} />
                       <input placeholder="Client" onChange={e=>setNewProject({...newProject, client:e.target.value})} style={{...styles.input, marginBottom:0}} />
                       <input placeholder="Budget" onChange={e=>setNewProject({...newProject, value:e.target.value})} style={{...styles.input, marginBottom:0}} />
                       <select onChange={e=>setNewProject({...newProject, status:e.target.value})} style={{...styles.input, marginBottom:0}}><option value="Planning">Planning</option><option value="Active">Active</option></select>
                       <button onClick={()=>submitAction('create_project', newProject)} style={{...styles.btn, background: colors.green}}>Launch</button>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px'}}>
                       {data.projects.map(p => (
                          <div key={p.id} style={styles.card}>
                             <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}><span style={{background: p.status==='Active'?'#dcfce7':'#f1f5f9', color: p.status==='Active'?'#16a34a':'#64748b', padding:'4px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold'}}>{p.status}</span><MapPin size={18} color='#64748b'/></div>
                             <h3>{p.project_name}</h3><p style={{color:'#64748b'}}>{p.client_name}</p>
                             <button onClick={()=>{setSelectedProject(p); setCurrentView('project_hub');}} style={{...styles.btn, background: colors.navy, width:'100%', justifyContent:'center'}}>Open Project Hub</button>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* 4. INVESTMENT & ASSET REGISTERS */}
               {currentView === 'finance' && (
                  <div style={styles.card}>
                     <h3>💰 Investment Register (Money In)</h3>
                     <div style={{display:'flex', gap:'10px', marginBottom:'20px', background:'#f8fafc', padding:'15px', borderRadius:'10px'}}>
                        <input placeholder="Investor Name" onChange={e=>setForms({...forms, investor:e.target.value})} style={{...styles.input, marginBottom:0}} />
                        <select onChange={e=>setForms({...forms, projectId:e.target.value})} style={{...styles.input, marginBottom:0}}><option>Select Project...</option>{data.projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}</select>
                        <input placeholder="Amount" onChange={e=>setForms({...forms, amount:e.target.value})} style={{...styles.input, marginBottom:0}} />
                        <button onClick={()=>submitAction('add_investment')} style={{...styles.btn, background: colors.green}}>Record Investment</button>
                     </div>
                     <table style={styles.table}><thead><tr><th style={styles.th}>Date</th><th style={styles.th}>Investor</th><th style={styles.th}>Project</th><th style={styles.th}>Amount</th></tr></thead>
                     <tbody>{data.investments.map(i => <tr key={i.id}><td style={styles.td}>{new Date(i.transaction_date).toLocaleDateString()}</td><td style={styles.td}>{i.investor_name}</td><td style={styles.td}>{i.project_name}</td><td style={styles.td}>₹{i.amount}</td></tr>)}</tbody></table>
                  </div>
               )}

               {currentView === 'assets' && (
                  <div style={styles.card}>
                     <h3>🚜 Asset & Machinery Register</h3>
                     <div style={{display:'flex', gap:'10px', marginBottom:'20px', background:'#f8fafc', padding:'15px', borderRadius:'10px'}}>
                        <input placeholder="Item Name (e.g. Mixer)" onChange={e=>setForms({...forms, name:e.target.value})} style={{...styles.input, marginBottom:0}} />
                        <input placeholder="Value" onChange={e=>setForms({...forms, value:e.target.value})} style={{...styles.input, marginBottom:0}} />
                        <input placeholder="Location" onChange={e=>setForms({...forms, location:e.target.value, status:'Available'})} style={{...styles.input, marginBottom:0}} />
                        <button onClick={()=>submitAction('manage_asset')} style={{...styles.btn, background: colors.blue}}>Add Asset</button>
                     </div>
                     <table style={styles.table}><thead><tr><th style={styles.th}>Item</th><th style={styles.th}>Value</th><th style={styles.th}>Location</th><th style={styles.th}>Status</th></tr></thead>
                     <tbody>{data.assets.map(a => <tr key={a.id}><td style={styles.td}>{a.item_name}</td><td style={styles.td}>₹{a.value}</td><td style={styles.td}>{a.current_location}</td><td style={styles.td}>{a.status}</td></tr>)}</tbody></table>
                  </div>
               )}
             </>
           )}
        </div>
      </div>
    );
  }

  // EMPLOYEE VIEW (Simple & Fast)
  if (user.role !== 'admin' && empData) {
    return (
      <div style={{...styles.container, background: colors.navy, color: 'white', padding: '20px'}}>
         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
            <div><div style={{fontSize: '0.8rem', opacity: 0.7}}>Welcome,</div><div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{user.full_name}</div></div>
            <button onClick={()=>{localStorage.removeItem('bita_user'); setUser(null);}} style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%'}}><LogOut size={18}/></button>
         </div>
         
         <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
            <button onClick={() => navigator.geolocation.getCurrentPosition(async (pos) => { await fetch('/api/employee', { method:'POST', body:JSON.stringify({action:'clock_in', username:user.username, lat:pos.coords.latitude, lng:pos.coords.longitude}) }); alert('Clocked In'); })} style={{...styles.btn, background: colors.green, flexDirection:'column', padding:'20px', justifyContent:'center'}}><MapPin size={24}/> Clock In</button>
            <button onClick={() => alert('View Work')} style={{...styles.btn, background: colors.blue, flexDirection:'column', padding:'20px', justifyContent:'center'}}><FileText size={24}/> My Tasks</button>
         </div>

         <div style={{background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px', marginBottom: '20px'}}>
            <h3>📝 Daily Report</h3>
            <select onChange={e=>setForms({...forms, projectId:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}}><option value="">Select Project...</option>{empData.projects.map(p=><option key={p.id} value={p.id}>{p.project_name}</option>)}</select>
            <input placeholder="Activity Done" onChange={e=>setForms({...forms, activity:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}} />
            <input placeholder="Materials Used" onChange={e=>setForms({...forms, material:e.target.value})} style={{...styles.input, background: colors.navy, color: 'white'}} />
            <button onClick={async ()=>{await fetch('/api/employee', { method:'POST', body:JSON.stringify({action:'submit_report', username:user.username, ...forms}) }); alert('Sent'); setForms({});}} style={{...styles.btn, background: colors.blue, width: '100%', justifyContent:'center'}}>Submit</button>
         </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}
