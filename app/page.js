'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, PieChart, Briefcase, Activity,
  Menu, MapPin, ArrowUpRight, LogOut, Package, DollarSign,
  ChevronLeft, Phone, Mail, UserPlus, FolderPlus, FileText
} from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // REAL DATA STATE (Fetched from API)
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('PHONE');
  const [loading, setLoading] = useState(false);
  
  // Forms State
  const [formInput, setFormInput] = useState({});

  // --- STYLES ---
  const colors = {
    navy: '#0f172a', blue: '#2563eb', green: '#16a34a', orange: '#ea580c', 
    bg: '#f8fafc', white: '#ffffff', border: '#e2e8f0', text: '#334155', textLight: '#94a3b8'
  };

  const styles = {
    container: { fontFamily: 'sans-serif', height: '100vh', display: 'flex', background: colors.bg, color: colors.text },
    sidebar: { width: isSidebarOpen ? '260px' : '70px', background: colors.navy, color: 'white', transition: 'all 0.3s', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, overflowY: 'auto', padding: '30px' },
    card: { background: colors.white, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
    title: { fontSize: '1.8rem', fontWeight: '800', color: colors.navy, margin: 0 },
    backBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: colors.text, marginBottom: '20px', fontSize: '1rem', fontWeight: '600' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '15px', borderBottom: `2px solid ${colors.bg}`, color: colors.textLight, fontSize: '0.85rem' },
    td: { padding: '15px', borderBottom: `1px solid ${colors.bg}` },
    actionBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginBottom: '15px', background: '#fff' }
  };

  // --- API ACTIONS ---
  
  // 1. LOGIN
  const handleLogin = (e) => { 
    e.preventDefault(); 
    setLoading(true); 
    // Simulate OTP for now
    setTimeout(() => { 
      setLoading(false); 
      if(step==='PHONE') setStep('OTP'); 
      else {
        const dummyUser = {name:'Admin User', role:'Director'};
        setUser(dummyUser);
        fetchDashboardData(); // Load real data on login
      }
    }, 1000); 
  };
  
  // 2. FETCH DATA
  async function fetchDashboardData() {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) });
      const data = await res.json();
      if (data.success) setDashboardData(data);
    } catch(e) { alert("Connection Error"); }
    setLoadingData(false);
  }

  // 3. SUBMIT FORMS
  async function handleFormSubmit(type) {
    if (type === 'project') {
      await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'create_project', ...formInput }) });
    } else if (type === 'employee') {
      await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'create_employee', ...formInput }) });
    }
    alert('Successfully Saved!');
    setFormInput({});
    fetchDashboardData(); // Refresh data
    navigate('dashboard');
  }

  // Navigation Helper
  const navigate = (view, item = null) => {
    setSelectedItem(item);
    setCurrentView(view);
  };

  // --- VIEWS COMPONENTS ---

  // 1. DASHBOARD
  const Dashboard = () => {
    if (!dashboardData) return <div>Loading Company Data...</div>;
    return (
      <div style={{animation: 'fadeIn 0.5s'}}>
         <div style={styles.grid}>
            <div onClick={() => navigate('revenue_details')} style={{...styles.card, cursor: 'pointer', borderLeft: `4px solid ${colors.green}`}}>
               <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight:'bold'}}>TOTAL REVENUE</div>
               <div style={{fontSize: '2rem', fontWeight: '800', margin: '10px 0'}}>₹{dashboardData.stats.revenue}</div>
               <div style={{fontSize: '0.8rem', color: colors.green, display:'flex', alignItems:'center'}}>View Finance <ArrowUpRight size={14}/></div>
            </div>

            <div onClick={() => navigate('active_projects')} style={{...styles.card, cursor: 'pointer', borderLeft: `4px solid ${colors.orange}`}}>
               <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight:'bold'}}>ACTIVE PROJECTS</div>
               <div style={{fontSize: '2rem', fontWeight: '800', margin: '10px 0'}}>{dashboardData.stats.active_count} Running</div>
               <div style={{fontSize: '0.8rem', color: colors.orange, display:'flex', alignItems:'center'}}>View Sites <ArrowUpRight size={14}/></div>
            </div>

            <div onClick={() => navigate('staff_list')} style={{...styles.card, cursor: 'pointer', borderLeft: `4px solid ${colors.blue}`}}>
               <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight:'bold'}}>TOTAL STAFF</div>
               <div style={{fontSize: '2rem', fontWeight: '800', margin: '10px 0'}}>{dashboardData.stats.staff_count}</div>
               <div style={{fontSize: '0.8rem', color: colors.blue, display:'flex', alignItems:'center'}}>View Directory <ArrowUpRight size={14}/></div>
            </div>

            <div onClick={() => navigate('growth')} style={{...styles.card, cursor: 'pointer', borderLeft: `4px solid #9333ea`}}>
               <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight:'bold'}}>YOY GROWTH</div>
               <div style={{fontSize: '2rem', fontWeight: '800', margin: '10px 0'}}>{dashboardData.stats.growth}</div>
               <div style={{fontSize: '0.8rem', color: '#9333ea', display:'flex', alignItems:'center'}}>Analytics <ArrowUpRight size={14}/></div>
            </div>
         </div>

         <div style={{marginTop: '30px'}}>
            <h3 style={{marginBottom: '15px', color: colors.text}}>🚀 Quick Actions</h3>
            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
               <button onClick={() => navigate('add_project')} style={{...styles.actionBtn, background: colors.navy}}>
                  <FolderPlus size={18}/> New Project
               </button>
               <button onClick={() => navigate('add_employee')} style={{...styles.actionBtn, background: colors.navy}}>
                  <UserPlus size={18}/> Hire Staff
               </button>
               <button onClick={() => navigate('finance')} style={{...styles.actionBtn, background: colors.navy}}>
                  <DollarSign size={18}/> Add Expense
               </button>
            </div>
         </div>
      </div>
    );
  };

  // 2. REVENUE / FINANCE PAGE
  const RevenuePage = () => (
     <div>
        <button onClick={() => navigate('dashboard')} style={styles.backBtn}><ChevronLeft size={20}/> Back to Dashboard</button>
        <h2 style={{...styles.title, marginBottom: '20px'}}>Finance & Revenue</h2>
        <div style={styles.card}>
           <table style={styles.table}>
              <thead><tr><th style={styles.th}>Project</th><th style={styles.th}>Client</th><th style={styles.th}>Budget</th><th style={styles.th}>Revenue In</th></tr></thead>
              <tbody>
                 {dashboardData.projects.map(p => (
                    <tr key={p.id}>
                       <td style={{...styles.td, fontWeight: 'bold'}}>{p.project_name}</td>
                       <td style={styles.td}>{p.client_name}</td>
                       <td style={styles.td}>₹{p.budget_total}</td>
                       <td style={{...styles.td, color: colors.green, fontWeight: 'bold'}}>₹{p.revenue_recognized || 0}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </div>
  );

  // 3. STAFF LIST PAGE
  const StaffListPage = () => (
     <div>
        <button onClick={() => navigate('dashboard')} style={styles.backBtn}><ChevronLeft size={20}/> Back to Dashboard</button>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
           <h2 style={styles.title}>Employee Directory</h2>
           <button onClick={() => navigate('add_employee')} style={{...styles.actionBtn, background: colors.blue}}><UserPlus size={18}/> Add New</button>
        </div>
        <div style={styles.card}>
           <table style={styles.table}>
              <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Role</th><th style={styles.th}>Site</th><th style={styles.th}>Action</th></tr></thead>
              <tbody>
                 {dashboardData.staff.map(s => (
                    <tr key={s.id} onClick={() => navigate('staff_profile', s)} style={{cursor: 'pointer', transition: 'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='white'}>
                       <td style={{...styles.td, color: colors.textLight}}>{s.username}</td>
                       <td style={{...styles.td, fontWeight: 'bold'}}>{s.full_name}</td>
                       <td style={styles.td}>{s.role}</td>
                       <td style={styles.td}>{s.current_site}</td>
                       <td style={{...styles.td, color: colors.blue}}>Profile →</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </div>
  );

  // 4. STAFF PROFILE
  const StaffProfilePage = ({ staff }) => (
     <div>
        <button onClick={() => navigate('staff_list')} style={styles.backBtn}><ChevronLeft size={20}/> Back to List</button>
        <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
           <div style={{...styles.card, flex: 1, textAlign: 'center', minWidth: '300px'}}>
              <div style={{width: '100px', height: '100px', borderRadius: '50%', background: colors.navy, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px'}}>
                 {staff.full_name.charAt(0)}
              </div>
              <h2 style={{margin: '0 0 5px 0'}}>{staff.full_name}</h2>
              <p style={{color: colors.textLight, margin: 0}}>{staff.role} • {staff.username}</p>
              <div style={{marginTop: '20px', textAlign: 'left', padding: '20px', background: colors.bg, borderRadius: '8px'}}>
                 <div style={{marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center'}}><Phone size={16}/> {staff.phone || 'N/A'}</div>
                 <div style={{marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center'}}><Mail size={16}/> {staff.email || 'N/A'}</div>
                 <div style={{marginBottom: '0', display: 'flex', gap: '10px', alignItems: 'center'}}><MapPin size={16}/> {staff.current_site}</div>
              </div>
           </div>
        </div>
     </div>
  );

  // 5. PROJECTS PAGE
  const ProjectsPage = () => (
     <div>
        <button onClick={() => navigate('dashboard')} style={styles.backBtn}><ChevronLeft size={20}/> Back to Dashboard</button>
        <h2 style={{...styles.title, marginBottom: '20px'}}>Project Sites</h2>
        <div style={styles.grid}>
           {dashboardData.projects.map(p => (
              <div key={p.id} style={styles.card}>
                 <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <span style={{background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>{p.status}</span>
                    <MapPin size={18} color={colors.textLight}/>
                 </div>
                 <h3 style={{margin: '0 0 5px 0'}}>{p.project_name}</h3>
                 <p style={{color: colors.textLight, fontSize: '0.9rem', margin: 0}}>{p.client_name}</p>
                 <div style={{margin: '20px 0'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px'}}>
                       <span>Progress</span><span>{p.completion_percent || 0}%</span>
                    </div>
                    <div style={{width: '100%', height: '8px', background: colors.bg, borderRadius: '4px'}}>
                       <div style={{width: `${p.completion_percent || 0}%`, background: colors.green, height: '100%', borderRadius: '4px'}}></div>
                    </div>
                 </div>
                 <button onClick={() => navigate('project_details', p)} style={{...styles.actionBtn, background: colors.navy, width: '100%', justifyContent: 'center'}}>View Details</button>
              </div>
           ))}
        </div>
     </div>
  );

  // 6. PROJECT DETAILS DRILL-DOWN
  const ProjectDetailsPage = ({ project }) => (
    <div>
       <button onClick={() => navigate('active_projects')} style={styles.backBtn}><ChevronLeft size={20}/> Back to Projects</button>
       <div style={{...styles.card, background: colors.navy, color: 'white'}}>
          <h2 style={{margin: '0 0 10px 0', color: 'white'}}>{project.project_name}</h2>
          <div style={{display: 'flex', gap: '20px', fontSize: '0.9rem', opacity: 0.9}}>
             <span>Client: {project.client_name}</span>
             <span>|</span>
             <span>Budget: ₹{project.budget_total}</span>
          </div>
       </div>
       <h3 style={{color: colors.text, margin: '25px 0 15px 0'}}>Construction Stages</h3>
       <div style={styles.card}>
          {project.stages && project.stages.length > 0 ? (
             project.stages.map((stage, index) => (
                <div key={index} style={{display: 'flex', gap: '15px', paddingBottom: '20px', borderLeft: '2px solid #e2e8f0', marginLeft: '10px', paddingLeft: '20px', position: 'relative'}}>
                   <div style={{position: 'absolute', left: '-6px', top: '0', width: '14px', height: '14px', borderRadius: '50%', background: stage.status === 'Completed' ? colors.green : '#cbd5e1'}}></div>
                   <div>
                      <div style={{fontWeight: 'bold'}}>{stage.stage_name}</div>
                      <div style={{fontSize: '0.85rem', color: colors.textLight}}>Status: {stage.status}</div>
                   </div>
                </div>
             ))
          ) : <p>No stages defined.</p>}
       </div>
    </div>
 );

  // 7. INPUT FORMS (Functional)
  const FormPage = ({ type }) => {
    const isProj = type === 'project';
    return (
     <div style={{maxWidth: '600px', margin: '0 auto'}}>
        <button onClick={() => navigate('dashboard')} style={styles.backBtn}><ChevronLeft size={20}/> Cancel</button>
        <div style={styles.card}>
           <h2 style={{marginTop: 0}}>{isProj ? 'Create New Project' : 'Hire New Employee'}</h2>
           
           {isProj ? (
             <>
               <input placeholder="Project Name" onChange={e => setFormInput({...formInput, name: e.target.value})} style={styles.input} />
               <input placeholder="Client Name" onChange={e => setFormInput({...formInput, client: e.target.value})} style={styles.input} />
               <input placeholder="Total Value (₹)" onChange={e => setFormInput({...formInput, value: e.target.value})} style={styles.input} />
               <input type="date" onChange={e => setFormInput({...formInput, start: e.target.value})} style={styles.input} />
             </>
           ) : (
             <>
               <input placeholder="Full Name" onChange={e => setFormInput({...formInput, fullName: e.target.value})} style={styles.input} />
               <input placeholder="Role (e.g. Engineer)" onChange={e => setFormInput({...formInput, role: e.target.value})} style={styles.input} />
               <input placeholder="Phone Number" onChange={e => setFormInput({...formInput, phone: e.target.value})} style={styles.input} />
               <input placeholder="Password" type="password" onChange={e => setFormInput({...formInput, password: e.target.value})} style={styles.input} />
             </>
           )}

           <button onClick={() => handleFormSubmit(type)} style={{...styles.actionBtn, background: colors.green, width: '100%', justifyContent: 'center'}}>Save to Database</button>
        </div>
     </div>
    );
  };

  // --- LOGIN SCREEN ---
  if (!user) {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fontFamily: 'sans-serif'}}>
        <div style={{background: 'rgba(255,255,255,0.95)', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '400px', textAlign: 'center'}}>
          <div style={{background: colors.blue, width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
            <Building2 size={30} color="white" />
          </div>
          <h1 style={{fontSize: '1.8rem', fontWeight: '800', color: colors.navy, margin: 0}}>BITA INFRA</h1>
          <p style={{color: colors.textLight}}>Enterprise Portal</p>
          <form onSubmit={handleLogin} style={{marginTop: '30px'}}>
             {step==='PHONE' ? <input placeholder="Mobile Number" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc', marginBottom:'15px'}} /> 
             : <input placeholder="OTP" value={otp} onChange={e=>setOtp(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc', marginBottom:'15px', textAlign:'center', fontSize:'1.2rem'}} />}
             <button style={{width:'100%', padding:'12px', borderRadius:'8px', border:'none', background:colors.blue, color:'white', fontWeight:'bold'}}>{loading ? '...' : step==='PHONE'?'Next':'Login'}</button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN APP RENDER ---
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={{padding: '20px', borderBottom: '1px solid #334155', display:'flex', alignItems:'center', gap:'10px'}}>
           <div style={{background: colors.blue, padding: '6px', borderRadius: '4px'}}><Building2 size={18}/></div>
           {isSidebarOpen && <div style={{fontWeight: 'bold'}}>BITA INFRA</div>}
        </div>
        <nav style={{padding: '20px 0'}}>
           <div onClick={() => navigate('dashboard')} style={{padding: '12px 20px', cursor: 'pointer', display: 'flex', gap: '15px', color: currentView === 'dashboard' ? colors.blue : '#94a3b8', background: currentView === 'dashboard' ? 'rgba(255,255,255,0.05)' : 'transparent'}}>
              <PieChart size={20}/> {isSidebarOpen && 'Overview'}
           </div>
           <div onClick={() => navigate('active_projects')} style={{padding: '12px 20px', cursor: 'pointer', display: 'flex', gap: '15px', color: currentView.includes('project') ? colors.blue : '#94a3b8'}}>
              <Briefcase size={20}/> {isSidebarOpen && 'Projects'}
           </div>
           <div onClick={() => navigate('staff_list')} style={{padding: '12px 20px', cursor: 'pointer', display: 'flex', gap: '15px', color: currentView.includes('staff') ? colors.blue : '#94a3b8'}}>
              <Users size={20}/> {isSidebarOpen && 'Staff'}
           </div>
           {/* NEW MODULES */}
           <div onClick={() => navigate('inventory')} style={{padding: '12px 20px', cursor: 'pointer', display: 'flex', gap: '15px', color: currentView === 'inventory' ? colors.blue : '#94a3b8'}}>
              <Package size={20}/> {isSidebarOpen && 'Inventory'}
           </div>
           <div onClick={() => navigate('revenue_details')} style={{padding: '12px 20px', cursor: 'pointer', display: 'flex', gap: '15px', color: currentView.includes('revenue') ? colors.blue : '#94a3b8'}}>
              <DollarSign size={20}/> {isSidebarOpen && 'Finance'}
           </div>
        </nav>
        <div style={{marginTop: 'auto', padding: '20px'}}>
           <button onClick={() => setUser(null)} style={{background: 'none', border: 'none', color: '#ef4444', display: 'flex', gap: '10px', cursor: 'pointer'}}><LogOut size={20}/> {isSidebarOpen && 'Logout'}</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={styles.main}>
        <div style={styles.header}>
           <div>
              <h1 style={{margin: 0, fontSize: '1.2rem'}}>Corporate Dashboard</h1>
              <p style={{margin: 0, fontSize: '0.8rem', color: colors.textLight}}>{new Date().toDateString()}</p>
           </div>
           <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
              <div style={{textAlign: 'right'}}>
                 <div style={{fontWeight: 'bold'}}>{user.name}</div>
                 <div style={{fontSize: '0.8rem', color: colors.textLight}}>{user.role}</div>
              </div>
              <div style={{width: '40px', height: '40px', background: colors.navy, color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{user.name.charAt(0)}</div>
           </div>
        </div>

        {/* Dynamic Page Rendering */}
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'revenue_details' && <RevenuePage />}
        {currentView === 'active_projects' && <ProjectsPage />}
        {currentView === 'project_details' && <ProjectDetailsPage project={selectedItem} />}
        {currentView === 'staff_list' && <StaffListPage />}
        {currentView === 'staff_profile' && <StaffProfilePage staff={selectedItem} />}
        
        {/* INPUT FORMS */}
        {currentView === 'add_project' && <FormPage type="project" />}
        {currentView === 'add_employee' && <FormPage type="employee" />}
        
        {/* PLACEHOLDERS FOR FUTURE MODULES */}
        {currentView === 'inventory' && <div style={{textAlign:'center', marginTop:'50px'}}><Package size={50} color={colors.textLight}/><h3>Inventory Module</h3><p>Coming Soon: Manage Cement & Steel Stock</p></div>}
        {currentView === 'growth' && <div style={{textAlign:'center', marginTop:'50px'}}><Activity size={50} color={colors.textLight}/><h3>Growth Analytics</h3></div>}
      </div>
    </div>
  );
}
