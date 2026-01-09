'use client';
import React, { useState } from 'react';
import { 
  Building2, Users, PieChart, Briefcase, Activity,
  Menu, MapPin, ArrowUpRight, LogOut,
  ChevronLeft, Phone, Mail, UserPlus, FolderPlus, FileText
} from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('dashboard'); // Controls which "Page" is open
  const [selectedItem, setSelectedItem] = useState(null); // Stores data for detail pages
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('PHONE');
  const [loading, setLoading] = useState(false);

  // --- MOCK DATA (Now with Stages!) ---
  const staffList = [
    { id: 'BIS001', name: 'Rahul Sharma', role: 'Project Manager', phone: '9876500001', email: 'rahul@bita.com', joined: '2022-03-15', site: 'Highway NH-42', status: 'Active' },
    { id: 'BIS002', name: 'Kruti Engineer', role: 'Site Engineer', phone: '9876500002', email: 'kruti@bita.com', joined: '2023-06-10', site: 'City Center Mall', status: 'On Site' },
    { id: 'BIS003', name: 'Amit Das', role: 'Accountant', phone: '9876500003', email: 'amit@bita.com', joined: '2021-11-01', site: 'Head Office', status: 'Active' },
    { id: 'BIS004', name: 'Suresh Oram', role: 'Supervisor', phone: '9876500004', email: 'suresh@bita.com', joined: '2024-01-20', site: 'Bita Heights', status: 'Leave' },
  ];

  const projectsList = [
    { 
      id: 1, 
      name: 'Highway NH-42', 
      client: 'NHAI', 
      value: '15 Cr', 
      status: 'Active', 
      progress: 72, 
      revenue: '8.5 Cr', 
      start: '2023-01', 
      end: '2025-06',
      // NEW: Construction Stages Data
      stages: [
        { name: 'Land Acquisition', status: 'Completed', date: 'Jan 2023' },
        { name: 'Soil Testing & Levelling', status: 'Completed', date: 'Mar 2023' },
        { name: 'Foundation / Bedding', status: 'Completed', date: 'Aug 2023' },
        { name: 'Paving / Layering', status: 'In Progress', date: 'Current' },
        { name: 'Signage & Finishing', status: 'Pending', date: 'Est. June 2025' }
      ]
    },
    { 
      id: 2, 
      name: 'Bita Heights', 
      client: 'Internal', 
      value: '12 Cr', 
      status: 'Planning', 
      progress: 10, 
      revenue: '0 Cr', 
      start: '2024-02', 
      end: '2026-12',
      stages: [
         { name: 'Architectural Design', status: 'Completed', date: 'Feb 2024' },
         { name: 'Govt Approvals', status: 'In Progress', date: 'Current' },
         { name: 'Excavation', status: 'Pending', date: 'May 2024' }
      ]
    },
    { 
      id: 3, 
      name: 'City Center Mall', 
      client: 'City Corp', 
      value: '25 Cr', 
      status: 'Active', 
      progress: 95, 
      revenue: '22 Cr', 
      start: '2022-05', 
      end: '2024-04',
      stages: [
         { name: 'Structure Work', status: 'Completed', date: '2023' },
         { name: 'Interiors', status: 'In Progress', date: 'Current' }
      ]
    },
    { 
      id: 4, 
      name: 'Govt School Block', 
      client: 'Odisha Govt', 
      value: '2 Cr', 
      status: 'Completed', 
      progress: 100, 
      revenue: '2 Cr', 
      start: '2023-01', 
      end: '2023-12', 
      stages: [] 
    },
  ];

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
    actionBtn: { padding: '10px 20px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }
  };

  // --- ACTIONS ---
  const handleLogin = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); if(step==='PHONE') setStep('OTP'); else setUser({name:'Admin User', role:'Director'}); }, 1000); };
  
  // Navigation Helper
  const navigate = (view, item = null) => {
    setSelectedItem(item);
    setCurrentView(view);
  };

  // --- VIEWS COMPONENTS ---

  // 1. DASHBOARD VIEW
  const Dashboard = () => (
    <div style={{animation: 'fadeIn 0.5s'}}>
       <div style={styles.grid}>
          <div onClick={() => navigate('revenue_details')} style={{...styles.card, cursor: 'pointer', borderLeft: `4px solid ${colors.green}`, transition: 'transform 0.2s'}} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
             <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight:'bold'}}>ANNUAL REVENUE</div>
             <div style={{fontSize: '2rem', fontWeight: '800', margin: '10px 0'}}>₹42.5 Cr</div>
             <div style={{fontSize: '0.8rem', color: colors.green, display:'flex', alignItems:'center'}}>Click for Breakdown <ArrowUpRight size={14}/></div>
          </div>

          <div onClick={() => navigate('active_projects')} style={{...styles.card, cursor: 'pointer', borderLeft: `4px solid ${colors.orange}`}}>
             <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight:'bold'}}>ACTIVE PROJECTS</div>
             <div style={{fontSize: '2rem', fontWeight: '800', margin: '10px 0'}}>3 Running</div>
             <div style={{fontSize: '0.8rem', color: colors.orange, display:'flex', alignItems:'center'}}>View Sites <ArrowUpRight size={14}/></div>
          </div>

          <div onClick={() => navigate('staff_list')} style={{...styles.card, cursor: 'pointer', borderLeft: `4px solid ${colors.blue}`}}>
             <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight:'bold'}}>TOTAL STAFF</div>
             <div style={{fontSize: '2rem', fontWeight: '800', margin: '10px 0'}}>{staffList.length}</div>
             <div style={{fontSize: '0.8rem', color: colors.blue, display:'flex', alignItems:'center'}}>View Directory <ArrowUpRight size={14}/></div>
          </div>

          <div onClick={() => navigate('growth')} style={{...styles.card, cursor: 'pointer', borderLeft: `4px solid #9333ea`}}>
             <div style={{color: colors.textLight, fontSize: '0.9rem', fontWeight:'bold'}}>YOY GROWTH</div>
             <div style={{fontSize: '2rem', fontWeight: '800', margin: '10px 0'}}>15.2%</div>
             <div style={{fontSize: '0.8rem', color: '#9333ea', display:'flex', alignItems:'center'}}>View Analytics <ArrowUpRight size={14}/></div>
          </div>
       </div>

       <div style={{marginTop: '30px'}}>
          <h3 style={{marginBottom: '15px', color: colors.text}}>🚀 Quick Actions</h3>
          <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap'}}>
             <button onClick={() => navigate('add_project')} style={{...styles.actionBtn, background: colors.navy}}>
                <FolderPlus size={18}/> Add New Project
             </button>
             <button onClick={() => navigate('add_employee')} style={{...styles.actionBtn, background: colors.navy}}>
                <UserPlus size={18}/> Hire Employee
             </button>
             <button onClick={() => navigate('reports')} style={{...styles.actionBtn, background: colors.navy}}>
                <FileText size={18}/> View Reports
             </button>
          </div>
       </div>
    </div>
  );

  // 2. REVENUE DETAILS PAGE
  const RevenuePage = () => (
     <div>
        <button onClick={() => navigate('dashboard')} style={styles.backBtn}><ChevronLeft size={20}/> Back to Dashboard</button>
        <h2 style={{...styles.title, marginBottom: '20px'}}>Revenue Breakdown (FY 2024-25)</h2>
        <div style={styles.card}>
           <table style={styles.table}>
              <thead><tr><th style={styles.th}>Project Name</th><th style={styles.th}>Client</th><th style={styles.th}>Total Value</th><th style={styles.th}>Revenue Recognized</th></tr></thead>
              <tbody>
                 {projectsList.map(p => (
                    <tr key={p.id}>
                       <td style={{...styles.td, fontWeight: 'bold'}}>{p.name}</td>
                       <td style={styles.td}>{p.client}</td>
                       <td style={styles.td}>₹{p.value}</td>
                       <td style={{...styles.td, color: colors.green, fontWeight: 'bold'}}>₹{p.revenue}</td>
                    </tr>
                 ))}
                 <tr style={{background: '#f1f5f9'}}>
                    <td style={{...styles.td, fontWeight: 'bold'}}>TOTAL</td>
                    <td style={styles.td}></td>
                    <td style={styles.td}></td>
                    <td style={{...styles.td, fontWeight: 'bold', fontSize: '1.2rem'}}>₹32.5 Cr</td>
                 </tr>
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
                 {staffList.map(s => (
                    <tr key={s.id} onClick={() => navigate('staff_profile', s)} style={{cursor: 'pointer', transition: 'background 0.2s'}} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='white'}>
                       <td style={{...styles.td, color: colors.textLight}}>{s.id}</td>
                       <td style={{...styles.td, fontWeight: 'bold'}}>{s.name}</td>
                       <td style={styles.td}>{s.role}</td>
                       <td style={styles.td}>{s.site}</td>
                       <td style={{...styles.td, color: colors.blue}}>View Profile →</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     </div>
  );

  // 4. STAFF PROFILE PAGE
  const StaffProfilePage = ({ staff }) => (
     <div>
        <button onClick={() => navigate('staff_list')} style={styles.backBtn}><ChevronLeft size={20}/> Back to List</button>
        <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
           <div style={{...styles.card, flex: 1, textAlign: 'center', minWidth: '300px'}}>
              <div style={{width: '100px', height: '100px', borderRadius: '50%', background: colors.navy, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px'}}>
                 {staff.name.charAt(0)}
              </div>
              <h2 style={{margin: '0 0 5px 0'}}>{staff.name}</h2>
              <p style={{color: colors.textLight, margin: 0}}>{staff.role} • {staff.id}</p>
              <div style={{marginTop: '20px', textAlign: 'left', padding: '20px', background: colors.bg, borderRadius: '8px'}}>
                 <div style={{marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center'}}><Phone size={16}/> {staff.phone}</div>
                 <div style={{marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center'}}><Mail size={16}/> {staff.email}</div>
                 <div style={{marginBottom: '0', display: 'flex', gap: '10px', alignItems: 'center'}}><MapPin size={16}/> {staff.site}</div>
              </div>
           </div>
           
           <div style={{...styles.card, flex: 2, minWidth: '300px'}}>
              <h3>Work History</h3>
              <div style={{marginTop: '20px'}}>
                 <div style={{paddingBottom: '15px', borderBottom: `1px solid ${colors.border}`, marginBottom: '15px'}}>
                    <div style={{fontWeight: 'bold'}}>Current Assignment</div>
                    <div>{staff.site} - Since Jan 2024</div>
                    <div style={{color: colors.green, fontSize: '0.9rem'}}>Status: {staff.status}</div>
                 </div>
                 <div style={{paddingBottom: '15px'}}>
                    <div style={{fontWeight: 'bold'}}>Date of Joining</div>
                    <div>{staff.joined}</div>
                 </div>
              </div>
           </div>
        </div>
     </div>
  );

  // 5. ACTIVE PROJECTS PAGE
  const ProjectsPage = () => (
     <div>
        <button onClick={() => navigate('dashboard')} style={styles.backBtn}><ChevronLeft size={20}/> Back to Dashboard</button>
        <h2 style={{...styles.title, marginBottom: '20px'}}>Active Project Sites</h2>
        <div style={styles.grid}>
           {projectsList.filter(p => p.status === 'Active' || p.status === 'Planning').map(p => (
              <div key={p.id} style={styles.card}>
                 <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <span style={{background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>{p.status.toUpperCase()}</span>
                    <MapPin size={18} color={colors.textLight}/>
                 </div>
                 <h3 style={{margin: '0 0 5px 0'}}>{p.name}</h3>
                 <p style={{color: colors.textLight, fontSize: '0.9rem', margin: 0}}>{p.client}</p>
                 <div style={{margin: '20px 0'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px'}}>
                       <span>Completion</span><span>{p.progress}%</span>
                    </div>
                    <div style={{width: '100%', height: '8px', background: colors.bg, borderRadius: '4px'}}>
                       <div style={{width: `${p.progress}%`, background: colors.green, height: '100%', borderRadius: '4px'}}></div>
                    </div>
                 </div>
                 <div style={{display: 'flex', gap: '10px'}}>
                    <button onClick={() => navigate('project_details', p)} style={{...styles.actionBtn, background: colors.navy, flex: 1, justifyContent: 'center'}}>View Details</button>
                    <button style={{...styles.actionBtn, background: colors.bg, color: colors.text, flex: 1, justifyContent: 'center'}}>Site Cam</button>
                 </div>
              </div>
           ))}
        </div>
     </div>
  );

  // 5.5 NEW: PROJECT DRILL-DOWN PAGE
  const ProjectDetailsPage = ({ project }) => (
    <div>
       <button onClick={() => navigate('active_projects')} style={styles.backBtn}><ChevronLeft size={20}/> Back to Projects</button>
       
       {/* Header Card */}
       <div style={{...styles.card, background: colors.navy, color: 'white'}}>
          <h2 style={{margin: '0 0 10px 0', color: 'white'}}>{project.name}</h2>
          <div style={{display: 'flex', gap: '20px', fontSize: '0.9rem', opacity: 0.9}}>
             <span>Client: {project.client}</span>
             <span>|</span>
             <span>Value: ₹{project.value}</span>
             <span>|</span>
             <span>Deadline: {project.end}</span>
          </div>
          <div style={{marginTop: '20px'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.8rem'}}>
                <span>Overall Completion</span><span>{project.progress}%</span>
             </div>
             <div style={{width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px'}}>
                <div style={{width: `${project.progress}%`, background: colors.green, height: '100%', borderRadius: '4px'}}></div>
             </div>
          </div>
       </div>

       {/* Stages Timeline */}
       <h3 style={{color: colors.text, margin: '25px 0 15px 0'}}>Construction Stages</h3>
       <div style={styles.card}>
          {project.stages && project.stages.length > 0 ? (
             project.stages.map((stage, index) => (
                <div key={index} style={{display: 'flex', gap: '15px', paddingBottom: '20px', borderLeft: index === project.stages.length - 1 ? 'none' : `2px solid ${colors.border}`, marginLeft: '10px', paddingLeft: '20px', position: 'relative'}}>
                   {/* Status Dot */}
                   <div style={{
                      position: 'absolute', left: '-6px', top: '0', width: '14px', height: '14px', borderRadius: '50%', 
                      background: stage.status === 'Completed' ? colors.green : stage.status === 'In Progress' ? colors.orange : '#cbd5e1',
                      border: `2px solid ${colors.white}`
                   }}></div>
                   
                   <div style={{width: '100%'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                         <span style={{fontWeight: 'bold', color: stage.status === 'Pending' ? colors.textLight : colors.text}}>{stage.name}</span>
                         <span style={{fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: stage.status === 'Completed' ? '#dcfce7' : stage.status === 'In Progress' ? '#ffedd5' : '#f1f5f9', color: stage.status === 'Completed' ? colors.green : stage.status === 'In Progress' ? colors.orange : colors.textLight, fontWeight: 'bold'}}>
                            {stage.status}
                         </span>
                      </div>
                      <div style={{fontSize: '0.85rem', color: colors.textLight}}>{stage.date}</div>
                   </div>
                </div>
             ))
          ) : (
             <p style={{color: colors.textLight, fontStyle: 'italic'}}>No detailed stage data available for this project.</p>
          )}
       </div>
    </div>
  );

  // 6. ADD FORMS
  const FormPage = ({ title }) => (
     <div style={{maxWidth: '600px', margin: '0 auto'}}>
        <button onClick={() => navigate('dashboard')} style={styles.backBtn}><ChevronLeft size={20}/> Cancel</button>
        <div style={styles.card}>
           <h2 style={{marginTop: 0}}>{title}</h2>
           <input placeholder="Enter Name..." style={{width:'100%', padding:'12px', border:`1px solid ${colors.border}`, borderRadius:'8px', marginBottom:'15px'}} />
           <input placeholder="Enter Details..." style={{width:'100%', padding:'12px', border:`1px solid ${colors.border}`, borderRadius:'8px', marginBottom:'15px'}} />
           <button onClick={() => {alert('Successfully Saved!'); navigate('dashboard');}} style={{...styles.actionBtn, background: colors.green, width: '100%', justifyContent: 'center'}}>Save Entry</button>
        </div>
     </div>
  );

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
        </nav>
        <div style={{marginTop: 'auto', padding: '20px'}}>
           <button onClick={() => setUser(null)} style={{background: 'none', border: 'none', color: '#ef4444', display: 'flex', gap: '10px', cursor: 'pointer'}}><LogOut size={20}/> {isSidebarOpen && 'Logout'}</button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div style={styles.main}>
        {/* Header */}
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
        {currentView === 'add_project' && <FormPage title="Create New Project" />}
        {currentView === 'add_employee' && <FormPage title="Hire New Employee" />}
        {currentView === 'growth' && (
           <div style={{textAlign: 'center', marginTop: '50px'}}>
              <Activity size={60} color={colors.textLight} />
              <h2 style={{color: colors.text}}>Growth Analytics Module</h2>
              <p style={{color: colors.textLight}}>Data integration in progress...</p>
              <button onClick={()=>navigate('dashboard')} style={{marginTop:'20px', border:'none', background:'none', color:colors.blue, cursor:'pointer'}}>Back Home</button>
           </div>
        )}
      </div>
    </div>
  );
}
