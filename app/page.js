'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('public'); // 'public', 'dashboard'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Login Form State
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- LOGIN LOGIC ---
  async function handleLogin() {
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setView('dashboard');
        setShowLogin(false);
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) {
      alert('Connection Error');
    }
    setLoading(false);
  }

  function handleLogout() {
    setUser(null);
    setView('public');
    setUsername('');
    setPassword('');
  }

  // --- COMPONENT: PUBLIC WEBSITE ---
  if (view === 'public') {
    return (
      <div style={{ fontFamily: '"Segoe UI", sans-serif', color: '#333', lineHeight: 1.6 }}>
        {/* NAVBAR */}
        <nav style={{ padding: '1.5rem 2rem', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
            BITA INFRA <span style={{ color: '#f97316', fontSize: '0.9rem' }}>& P&P</span>
          </div>
          <div>
            <a href="#services" style={{ marginRight: '20px', textDecoration: 'none', color: '#333', fontWeight: '500' }}>Services</a>
            <a href="#portfolio" style={{ marginRight: '20px', textDecoration: 'none', color: '#333', fontWeight: '500' }}>Projects</a>
            <button 
              onClick={() => setShowLogin(true)}
              style={{ padding: '8px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Portal Login
            </button>
          </div>
        </nav>

        {/* HERO SECTION */}
        <header style={{ 
          background: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1950")', 
          backgroundSize: 'cover', backgroundPosition: 'center', 
          height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white' 
        }}>
          <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Building the Future of Odisha</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Specialized in Government Infrastructure, School ACRs, and Commercial Complexes.
            </p>
            <a href="https://forms.gle/v3keWBBpppa18k4Q8" target="_blank">
              <button style={{ padding: '15px 30px', fontSize: '1.1rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Request a Free Quote
              </button>
            </a>
          </div>
        </header>

        {/* SERVICES */}
        <section id="services" style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '3rem' }}>Our Expertise</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {['General Contracting', 'Government Projects (ACR)', 'Commercial Interiors'].map((service, i) => (
              <div key={i} style={{ padding: '2rem', background: '#f8fafc', borderRadius: '8px', borderBottom: '4px solid #f97316' }}>
                <h3 style={{ color: '#0f172a' }}>{service}</h3>
                <p>Delivering high-quality execution with strict adherence to timelines and safety standards.</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#0f172a', color: 'white', padding: '3rem 2rem', textAlign: 'center' }}>
          <p>© 2025 BITA INFRA AND SERVICES PRIVATE LIMITED</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Pradeep Rana | Pitambar Tandi</p>
        </footer>

        {/* LOGIN MODAL */}
        {showLogin && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '10px', width: '90%', maxWidth: '400px', position: 'relative' }}>
              <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Portal Access</h2>
              <input 
                type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
              <input 
                type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
              <button 
                onClick={handleLogin} disabled={loading}
                style={{ width: '100%', padding: '12px', background: '#f97316', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {loading ? 'Verifying...' : 'Secure Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- COMPONENT: CLIENT DASHBOARD ---
  if (view === 'dashboard' && user?.role === 'client') {
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'sans-serif' }}>
        <nav style={{ background: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>MY PROJECT DASHBOARD</div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </nav>
        
        <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
            <h1 style={{ margin: 0, color: '#0f172a' }}>Welcome, {user.full_name}</h1>
            <p style={{ color: '#64748b' }}>Project: Tentulikhunti High School ACR</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* PROGRESS CARD */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3>📊 Live Progress</h3>
              <div style={{ margin: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Current Phase: <strong>Finishing</strong></span>
                  <span>90%</span>
                </div>
                <div style={{ width: '100%', height: '15px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '90%', height: '100%', background: '#22c55e' }}></div>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Last Update: Painting work in progress on 1st Floor.</p>
            </div>

            {/* FINANCIALS CARD */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3>💰 Financial Overview</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <span>Total Budget</span>
                <strong>₹25,00,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', color: '#22c55e' }}>
                <span>Paid</span>
                <strong>₹20,00,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', color: '#f97316', fontWeight: 'bold' }}>
                <span>Due Balance</span>
                <strong>₹5,00,000</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- COMPONENT: EMPLOYEE DASHBOARD ---
  if (view === 'dashboard' && user?.role === 'employee') {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>SITE COMMAND CENTER</div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </nav>

        <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '10px', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>👷 {user.full_name}</h2>
            <p style={{ color: '#94a3b8' }}>Assigned Site: Ichhapada PUPS</p>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <button 
              onClick={() => alert('📍 GPS Location Captured.\n🕒 Clock In Successful at 9:00 AM')}
              style={{ padding: '20px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              🕒 CLOCK IN NOW
            </button>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '10px' }}>
              <h3>Daily Report</h3>
              <input type="text" placeholder="Material Used (e.g. 10 bags cement)" style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: 'none' }} />
              <textarea placeholder="Work Description..." rows="3" style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: 'none' }}></textarea>
              <button 
                onClick={() => window.open('https://forms.gle/v3keWBBpppa18k4Q8', '_blank')}
                style={{ width: '100%', padding: '12px', background: '#f97316', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Upload Photo Evidence
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // Fallback
}
