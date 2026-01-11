'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, PieChart, Briefcase, Activity, DollarSign,
  MapPin, LogOut, Check, X, Trash2, RefreshCw, Package, HardHat,
  ChevronLeft, Phone, Mail, UserPlus, FolderPlus, Camera, Save, 
  FileText, TrendingUp, PenTool, ArrowRight, Menu, ShieldCheck, 
  Globe, CheckCircle, AlertTriangle, RefreshCcw
} from 'lucide-react';

// --- SUB-COMPONENTS ---

// 1. PUBLIC LANDING PAGE
const LandingPage = ({ onLoginClick }) => {
  const colors = { navy: '#0f172a', blue: '#2563eb', white: '#ffffff', gray: '#f1f5f9' };
  
  return (
    <div style={{fontFamily: 'sans-serif', color: '#334155'}}>
      <nav style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 40px', background: colors.navy, color:'white', position:'sticky', top:0, zIndex:100}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
           <div style={{background:colors.blue, padding:'8px', borderRadius:'8px'}}><Building2 size={24}/></div>
           <span style={{fontWeight:'800', fontSize:'1.2rem', letterSpacing:'1px'}}>BITA INFRA</span>
        </div>
        <button onClick={onLoginClick} style={{background:colors.blue, border:'none', color:'white', padding:'10px 20px', borderRadius:'6px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px'}}>
           Portal Login <ArrowRight size={16}/>
        </button>
      </nav>

      <header style={{height:'80vh', background:'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'20px'}}>
         <div style={{maxWidth:'800px'}}>
            <h1 style={{fontSize:'3.5rem', fontWeight:'900', margin:'0 0 20px 0', lineHeight:'1.1'}}>Building the Infrastructure<br/><span style={{color:colors.blue}}>of Tomorrow</span></h1>
            <p style={{fontSize:'1.2rem', color:'#94a3b8', marginBottom:'40px'}}>The leading construction management and infrastructure development firm. We deliver excellence from foundation to finish.</p>
            <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
               <button onClick={onLoginClick} style={{padding:'15px 40px', borderRadius:'50px', border:'none', background:colors.blue, color:'white', fontWeight:'bold', fontSize:'1rem', cursor:'pointer'}}>Access System</button>
            </div>
         </div>
      </header>
    </div>
  );
};

// 2. INTERNAL SYSTEM
const DashboardSystem = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [data, setData] = useState(null); 
  const [empData, setEmpData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fetchError, setFetchError] = useState(null); // NEW: Track Errors
  const [isLoading, setIsLoading] = useState(true);   // NEW: Track Loading State

  const colors = { navy: '#0f172a', blue: '#2563eb', green: '#16a34a', orange: '#ea580c', red: '#dc2626', bg: '#f8fafc', white: '#ffffff', border: '#e2e8f0', text: '#334155' };
  const styles = {
    container: { fontFamily: 'sans-serif', minHeight: '100vh', background: colors.bg, color: colors.text, display: 'flex' },
    card: { background: colors.white, borderRadius: '12px', padding: '24px', border: `1px solid ${colors.border}`, marginBottom: '20px' },
    btn: { padding: '10px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' },
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setFetchError(null);
    try {
      if(user.role === 'admin') {
        const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ action: 'get_dashboard' }) });
        const d = await res.json();
        if(d.success) setData(d);
        else throw new Error(d.message || 'Failed to load Admin Data');
      } else {
        const res = await fetch('/api/employee', { method: 'POST', body: JSON.stringify({ action: 'get_data' }) });
        const d = await res.json();
        if(d.success) setEmpData(d);
        else throw new Error(d.message || 'Failed to load Employee Data');
      }
    } catch (err) {
      console.error(err);
      setFetchError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ERROR STATE VIEW
  if (fetchError) {
    return (
      <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', background:'#f8fafc', color:'#334155'}}>
        <AlertTriangle size={50} color={colors.red} style={{marginBottom:'20px'}}/>
        <h2>Connection Failed</h2>
        <p style={{marginBottom:'20px', color:'#64748b'}}>Server said: "{fetchError}"</p>
        <div style={{display:'flex', gap:'10px'}}>
           <button onClick={fetchData} style={{...styles.btn, background: colors.blue}}><RefreshCcw size={16}/> Retry Connection</button>
           <button onClick={onLogout} style={{...styles.btn, background: colors.navy}}>Logout</button>
        </div>
        <p style={{marginTop:'30px', fontSize:'0.8rem', color:'#94a3b8'}}>Tip: The database might be sleeping. Wait 10s and click Retry.</p>
      </div>
    );
  }

  // LOADING STATE VIEW
  if (isLoading) {
    return (
      <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', background:'#f8fafc'}}>
        <div style={{width:'40px', height:'40px', border:'4px solid #e2e8f0', borderTop:'4px solid #2563eb', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
        <p style={{marginTop:'20px', color:'#64748b', fontWeight:'500'}}>Connecting to Headquarters...</p>
        <style>{`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}</style>
      </div>
    );
  }

  // ADMIN VIEW
  if (user.role === 'admin' && data) {
    return (
      <div style={styles.container}>
        <div style={{width: isSidebarOpen ? '260px' : '70px', background: colors.navy, color: 'white', padding: '20px', transition: 'width 0.3s'}}>
           <div style={{marginBottom: '30px', display: 'flex', gap: '10px', alignItems: 'center'}}><Building2 size={24} color={colors.blue}/> {isSidebarOpen && <span style={{fontWeight: 'bold'}}>BITA ERP</span>}</div>
           {[ {id: 'dashboard', icon: PieChart, label: 'Overview'}, {id: 'projects', icon: Briefcase, label: 'Projects'} ].map(item => (
             <div key={item.id} onClick={()=>setCurrentView(item.id)} style={{padding: '12px', cursor: 'pointer', display: 'flex', gap: '15px', color: currentView === item.id ? colors.blue : '#94a3b8'}}><item.icon size={20}/> {isSidebarOpen && item.label}</div>
           ))}
           <div style={{marginTop: '50px', borderTop: '1px solid #333', paddingTop: '20px'}}>
              <button onClick={onLogout} style={{background:'none', border:'none', color: colors.red, display:'flex', gap:'10px', cursor:'pointer'}}><LogOut size={20}/> {isSidebarOpen && 'Logout'}</button>
           </div>
        </div>
        <div style={{flex: 1, padding: '30px', overflowY: 'auto'}}>
           {currentView === 'dashboard' && (
             <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
                <div style={styles.card}><h3>Revenue</h3><h2>₹{data.stats.revenue}</h2></div>
                <div style={styles.card}><h3>Expenses</h3><h2>₹{data.stats.expense}</h2></div>
                <div style={styles.card}><h3>Active Projects</h3><h2>{data.stats.active}</h2></div>
             </div>
           )}
           {currentView === 'projects' && (
              <div style={styles.card}>
                 <h3>Projects</h3>
                 {data.projects.map(p => <div key={p.id} style={{padding:'10px 0', borderBottom:'1px solid #eee'}}><strong>{p.project_name}</strong> - {p.status}</div>)}
              </div>
           )}
        </div>
      </div>
    );
  }

  // EMPLOYEE VIEW
  if (user.role !== 'admin' && empData) {
    return (
      <div style={{fontFamily: 'sans-serif', minHeight: '100vh', background: colors.navy, color: 'white', padding: '20px'}}>
         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
            <div><div style={{fontSize: '0.8rem', opacity: 0.7}}>Welcome,</div><div style={{fontSize: '1.2rem', fontWeight: 'bold'}}>{user.full_name}</div></div>
            <button onClick={onLogout} style={{background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%'}}><LogOut size={18}/></button>
         </div>
         <button style={{width:'100%', padding:'30px', borderRadius:'20px', background: colors.green, border:'none', color:'white', marginBottom:'30px', display:'flex', alignItems:'center', justifyContent:'center', gap:'15px'}}><MapPin size={30}/> CLOCK IN</button>
         <div style={{textAlign:'center', padding:'20px', background:'rgba(255,255,255,0.1)', borderRadius:'12px'}}>
             <h3>Active Projects</h3>
             {empData.projects.map(p => <div key={p.id} style={{padding:'5px'}}>{p.project_name}</div>)}
         </div>
      </div>
    );
  }
  return <div>Loading Dashboard...</div>;
};

// 3. MAIN APP CONTROLLER
export default function App() {
  const [view, setView] = useState('landing');
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bita_user');
    if (saved) { setUser(JSON.parse(saved)); setView('dashboard'); }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(loginForm) });
      const d = await res.json();
      if (d.success) {
        localStorage.setItem('bita_user', JSON.stringify(d.user));
        setUser(d.user);
        setView('dashboard');
      } else alert(d.message);
    } catch(err) { alert('Network Error'); }
    setLoading(false);
  };

  const handleLogout = () => { localStorage.removeItem('bita_user'); setUser(null); setView('landing'); };

  if (view === 'landing') return <LandingPage onLoginClick={() => setView('login')} />;
  
  if (view === 'login') return (
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fontFamily:'sans-serif'}}>
      <div style={{background: 'rgba(255,255,255,0.95)', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}>
        <button onClick={() => setView('landing')} style={{background:'none', border:'none', cursor:'pointer', marginBottom:'20px', display:'flex', alignItems:'center', gap:'5px', color:'#64748b'}}><ChevronLeft size={16}/> Back to Home</button>
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
           <div style={{background: '#2563eb', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}><Building2 size={32} color="white" /></div>
           <h1 style={{fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: 0}}>Portal Access</h1>
        </div>
        <input placeholder="Username" onChange={e=>setLoginForm({...loginForm, username:e.target.value})} style={{width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', marginBottom: '16px'}} />
        <input type="password" placeholder="Password" onChange={e=>setLoginForm({...loginForm, password:e.target.value})} style={{width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', marginBottom: '16px'}} />
        <button onClick={handleLogin} disabled={loading} style={{width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer'}}>{loading ? 'Verifying...' : 'Secure Login'}</button>
      </div>
    </div>
  );

  if (view === 'dashboard' && user) return <DashboardSystem user={user} onLogout={handleLogout} />;
  return <div>Loading...</div>;
}
