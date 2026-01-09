'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, TrendingUp, Briefcase, PieChart, Activity,
  Menu, X, MapPin, ArrowUpRight, DollarSign, HardHat, LogOut, Globe, ShieldCheck
} from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('PHONE');
  const [loading, setLoading] = useState(false);

  // --- STYLES (Color Palette) ---
  const colors = {
    navy: '#0f172a',      // Sidebar
    darkBlue: '#1e293b',  // Sidebar Hover
    blue: '#2563eb',      // Primary Actions
    blueLight: '#eff6ff', // Light Blue bg
    green: '#16a34a',     // Success
    orange: '#ea580c',    // Warning
    bg: '#f8fafc',        // Main Background
    white: '#ffffff',
    textDark: '#1e293b',
    textGray: '#64748b',
    border: '#e2e8f0'
  };

  const styles = {
    container: { fontFamily: 'sans-serif', height: '100vh', display: 'flex', background: colors.bg, color: colors.textDark },
    sidebar: { 
      width: isSidebarOpen ? '260px' : '70px', 
      background: colors.navy, color: 'white', 
      transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column',
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)', zIndex: 100
    },
    main: { flex: 1, overflowY: 'auto', position: 'relative' },
    header: { 
      background: colors.white, padding: '15px 30px', 
      borderBottom: `1px solid ${colors.border}`, display: 'flex', 
      justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50
    },
    card: {
      background: colors.white, borderRadius: '12px', padding: '24px',
      border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    input: {
      width: '100%', padding: '12px', borderRadius: '8px', 
      border: `1px solid ${colors.border}`, fontSize: '1rem', marginBottom: '15px'
    },
    button: {
      width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
      background: colors.blue, color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
    },
    navItem: (active) => ({
      padding: '12px 15px', margin: '5px 10px', borderRadius: '8px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '12px',
      background: active ? colors.blue : 'transparent',
      color: active ? 'white' : '#94a3b8',
      fontSize: '0.95rem'
    })
  };

  // --- ACTIONS ---
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if(step === 'PHONE') setStep('OTP');
      else setUser({ name: 'Admin User', role: 'Director' });
    }, 1000);
  };

  // --- VIEWS ---

  // 1. LOGIN SCREEN
  if (!user) {
    return (
      <div style={{...styles.container, justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
        <div style={{background: 'rgba(255,255,255,0.95)', padding: '40px', borderRadius: '20px', width: '90%', maxWidth: '400px', textAlign: 'center'}}>
          <div style={{background: colors.blue, width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
            <Building2 size={30} color="white" />
          </div>
          <h1 style={{fontSize: '1.8rem', fontWeight: '800', color: colors.navy, margin: 0}}>BITA INFRA</h1>
          <p style={{color: colors.textGray, marginTop: '5px', fontSize: '0.9rem'}}>Enterprise Portal</p>
          
          <form onSubmit={handleLogin} style={{marginTop: '30px'}}>
            {step === 'PHONE' ? (
              <>
                <div style={{textAlign: 'left', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.8rem', color: colors.textGray}}>Mobile Number</div>
                <input placeholder="98765 43210" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} style={styles.input} />
                <button style={styles.button}>{loading ? 'Sending...' : 'Continue Securely'}</button>
              </>
            ) : (
              <>
                <p style={{marginBottom: '20px', color: colors.textGray}}>Enter OTP sent to +91 {phoneNumber}</p>
                <input placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value)} style={{...styles.input, textAlign: 'center', letterSpacing: '5px', fontSize: '1.5rem'}} />
                <button style={{...styles.button, background: colors.green}}>{loading ? 'Verifying...' : 'Login'}</button>
              </>
            )}
          </form>
          <div style={{marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'}}>
            <ShieldCheck size={14} /> Secure Server
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD
  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={{padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #334155'}}>
          <div style={{background: colors.blue, padding: '8px', borderRadius: '6px'}}><Building2 size={20} /></div>
          {isSidebarOpen && <div><div style={{fontWeight: 'bold'}}>BITA INFRA</div><div style={{fontSize: '0.7rem', color: '#94a3b8'}}>CORP OS</div></div>}
        </div>
        
        <nav style={{padding: '20px 0'}}>
          {[
            { id: 'dashboard', label: 'Overview', icon: PieChart },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'org', label: 'Organization', icon: Users },
            { id: 'analytics', label: 'Reports', icon: Activity },
          ].map(item => (
            <div key={item.id} onClick={() => setActiveTab(item.id)} style={styles.navItem(activeTab === item.id)}>
              <item.icon size={20} />
              {isSidebarOpen && item.label}
            </div>
          ))}
        </nav>

        <div style={{marginTop: 'auto', padding: '20px', borderTop: '1px solid #334155'}}>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center'}}>
             <Menu size={20} /> {isSidebarOpen && "Collapse"}
           </button>
           <button onClick={() => setUser(null)} style={{marginTop: '15px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center'}}>
             <LogOut size={20} /> {isSidebarOpen && "Logout"}
           </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h2 style={{margin: 0, fontSize: '1.5rem'}}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <div style={{fontSize: '0.8rem', color: colors.textGray, marginTop: '4px'}}>Welcome back, {user.name}</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
             <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '0.7rem', color: colors.textGray}}>TODAY</div>
                <div style={{fontWeight: 'bold'}}>{new Date().toLocaleDateString()}</div>
             </div>
             <div style={{width: '40px', height: '40px', borderRadius: '50%', background: colors.navy, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                {user.name.charAt(0)}
             </div>
          </div>
        </div>

        <div style={{padding: '30px'}}>
          {activeTab === 'dashboard' && (
            <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
              {/* STATS ROW */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px'}}>
                {[
                  { label: 'Annual Revenue', val: '₹42.5 Cr', icon: DollarSign, color: colors.green },
                  { label: 'Active Projects', val: '18', icon: HardHat, color: colors.orange },
                  { label: 'Total Staff', val: '145', icon: Users, color: colors.blue },
                  { label: 'Growth', val: '15.2%', icon: TrendingUp, color: '#9333ea' },
                ].map((stat, i) => (
                  <div key={i} style={styles.card}>
                     <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                        <div>
                          <div style={{fontSize: '0.9rem', color: colors.textGray}}>{stat.label}</div>
                          <div style={{fontSize: '1.8rem', fontWeight: 'bold', marginTop: '5px'}}>{stat.val}</div>
                        </div>
                        <div style={{background: `${stat.color}20`, padding: '10px', borderRadius: '8px', color: stat.color}}>
                           <stat.icon size={24} />
                        </div>
                     </div>
                  </div>
                ))}
              </div>
              
              {/* CHARTS ROW */}
              <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px'}}>
                 <div style={styles.card}>
                    <h3 style={{marginTop: 0}}>Revenue Distribution</h3>
                    <div style={{marginTop: '20px'}}>
                       {[{l:'Civil', v:45, c:colors.blue}, {l:'Infra', v:35, c:'#0ea5e9'}, {l:'Govt', v:20, c:'#6366f1'}].map(item => (
                          <div key={item.l} style={{marginBottom: '15px'}}>
                             <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem'}}>
                                <span>{item.l}</span><span>{item.v}%</span>
                             </div>
                             <div style={{height: '10px', background: '#f1f5f9', borderRadius: '5px'}}>
                                <div style={{width: `${item.v}%`, background: item.c, height: '100%', borderRadius: '5px'}}></div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
                 <div style={{...styles.card, background: colors.navy, color: 'white'}}>
                    <h3>Quick Actions</h3>
                    <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                       <button style={{padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', textAlign: 'left', cursor: 'pointer'}}>+ New Project</button>
                       <button style={{padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', textAlign: 'left', cursor: 'pointer'}}>+ Add Employee</button>
                       <button style={{padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', textAlign: 'left', cursor: 'pointer'}}>View Reports</button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
             <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
                {[
                  { n: 'Highway NH-42', t: 'Infrastructure', p: 72, s: 'Active' },
                  { n: 'Bita Heights', t: 'Residential', p: 10, s: 'Planning' },
                  { n: 'City Center Mall', t: 'Commercial', p: 95, s: 'Finishing' },
                ].map((p, i) => (
                   <div key={i} style={styles.card}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                         <span style={{background: colors.blueLight, color: colors.blue, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>{p.t}</span>
                         <MapPin size={16} color={colors.textGray} />
                      </div>
                      <h3 style={{margin: '15px 0 5px 0'}}>{p.n}</h3>
                      <div style={{marginBottom: '15px', fontSize: '0.9rem', color: colors.textGray}}>Status: {p.s}</div>
                      <div style={{height: '6px', background: '#f1f5f9', borderRadius: '3px'}}>
                         <div style={{width: `${p.p}%`, background: p.p > 80 ? colors.green : colors.blue, height: '100%', borderRadius: '3px'}}></div>
                      </div>
                      <div style={{marginTop: '5px', fontSize: '0.8rem', textAlign: 'right'}}>{p.p}% Complete</div>
                   </div>
                ))}
             </div>
          )}
          
          {activeTab === 'org' && (
             <div style={{...styles.card, textAlign: 'center', minHeight: '400px'}}>
                <h3>Corporate Structure</h3>
                <div style={{marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                   <div style={{padding: '15px 30px', background: colors.navy, color: 'white', borderRadius: '8px', fontWeight: 'bold'}}>Managing Director</div>
                   <div style={{height: '30px', width: '2px', background: '#cbd5e1'}}></div>
                   <div style={{display: 'flex', gap: '40px'}}>
                      <div>
                         <div style={{height: '20px', width: '2px', background: '#cbd5e1', margin: '0 auto'}}></div>
                         <div style={{padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '8px'}}>Project Head</div>
                      </div>
                      <div>
                         <div style={{height: '20px', width: '2px', background: '#cbd5e1', margin: '0 auto'}}></div>
                         <div style={{padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '8px'}}>Finance Head</div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'analytics' && (
             <div style={{...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', border: '2px dashed #cbd5e1'}}>
                <Activity size={50} color="#cbd5e1" />
                <h3 style={{color: colors.textGray}}>Analytics Module</h3>
                <p style={{color: colors.textGray}}>Connect Data Source to view reports</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}
