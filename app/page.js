'use client';
import { useState } from 'react';

export default function Home() {
  // --- STATE ---
  const [view, setView] = useState('public'); 
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form Data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---
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
    } catch (err) { alert('Connection Error'); }
    setLoading(false);
  }

  async function handleRegister() {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName, role: 'client' }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert('✅ Account Created! Please Login.');
        setIsRegistering(false); // Switch back to login
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) { alert('Connection Error'); }
    setLoading(false);
  }

  function handleLogout() {
    setUser(null);
    setView('public');
    setUsername('');
    setPassword('');
  }

  // --- PUBLIC PAGE ---
  if (view === 'public') {
    return (
      <div style={{ fontFamily: '"Segoe UI", sans-serif', color: '#333', lineHeight: 1.6 }}>
        {/* NAVBAR */}
        <nav style={{ padding: '1.5rem 2rem', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
            BITA INFRA <span style={{ color: '#f97316', fontSize: '0.9rem' }}>& P&P</span>
          </div>
          <button 
            onClick={() => { setShowLogin(true); setIsRegistering(false); }}
            style={{ padding: '8px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Portal Login
          </button>
        </nav>

        {/* HERO */}
        <header style={{ 
          background: 'linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1950")', 
          backgroundSize: 'cover', backgroundPosition: 'center', 
          height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white' 
        }}>
          <div>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Building the Future of Odisha</h1>
            <a href="https://forms.gle/v3keWBBpppa18k4Q8" target="_blank">
              <button style={{ padding: '15px 30px', fontSize: '1.1rem', background: '#f97316', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Request a Free Quote
              </button>
            </a>
          </div>
        </header>

        {/* LOGIN MODAL */}
        {showLogin && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '10px', width: '90%', maxWidth: '400px', position: 'relative' }}>
              <button onClick={() => setShowLogin(false)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
              
              <h2 style={{ marginBottom: '1rem', color: '#0f172a' }}>{isRegistering ? 'Create Account' : 'Portal Access'}</h2>

              {isRegistering && (
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }} />
              )}
              
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc' }} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc' }} />

              {isRegistering ? (
                <button onClick={handleRegister} disabled={loading} style={{ width: '100%', padding: '10px', background: '#22c55e', color: 'white', border: 'none', cursor: 'pointer' }}>{loading ? 'Creating...' : 'Sign Up'}</button>
              ) : (
                <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '10px', background: '#f97316', color: 'white', border: 'none', cursor: 'pointer' }}>{loading ? 'Verifying...' : 'Login'}</button>
              )}

              <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
                {isRegistering ? "Has Account? " : "New User? "}
                <span onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>
                  {isRegistering ? "Login Here" : "Create Account"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DASHBOARDS ---
  if (view === 'dashboard' && user) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1>Welcome, {user.full_name}</h1>
          <button onClick={handleLogout} style={{ padding: '10px', background: 'red', color: 'white', border: 'none' }}>Logout</button>
        </div>
        
        {user.role === 'client' ? (
           <div style={{ background: '#e0f2fe', padding: '20px', borderRadius: '8px' }}>
             <h2>📊 Client Dashboard</h2>
             <p>No active projects linked yet. Please contact admin.</p>
           </div>
        ) : (
           <div style={{ background: '#ffedd5', padding: '20px', borderRadius: '8px' }}>
             <h2>👷 Employee Dashboard</h2>
             <button onClick={() => alert('GPS Clock In Successful!')} style={{ padding: '15px', background: 'orange', border: 'none', fontSize: '1.2rem' }}>📍 Clock In</button>
           </div>
        )}
      </div>
    );
  }
  return null;
}
