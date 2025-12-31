'use client';
import { useState } from 'react';

export default function Home() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    // This talks to YOUR Neon Database via the API we will build next
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setUser(data.user);
      setView('dashboard');
    } else {
      alert('❌ ' + data.message);
    }
  }

  if (view === 'dashboard' && user) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>Welcome, {user.full_name}</h1>
        <p>Role: <strong>{user.role}</strong></p>
        <hr />
        {user.role === 'client' ? (
          <div style={{ background: '#e0f2fe', padding: '20px', borderRadius: '8px' }}>
            <h2>🏡 Your Project Status</h2>
            <h3>Tentulikhunti High School ACR</h3>
            <p>Status: <strong>Finishing</strong></p>
            <div style={{ width: '100%', background: '#ccc', height: '20px' }}>
              <div style={{ width: '90%', background: 'green', height: '100%' }}></div>
            </div>
            <p>90% Complete</p>
          </div>
        ) : (
          <div style={{ background: '#ffedd5', padding: '20px', borderRadius: '8px' }}>
            <h2>👷 Site Command Center</h2>
            <button onClick={() => alert('GPS Logged!')} style={{ padding: '10px', background: 'orange', border: 'none', color: 'white' }}>
              📍 Clock In (GPS)
            </button>
          </div>
        )}
        <br />
        <button onClick={() => setView('home')}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* HEADER */}
      <header style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>BITA INFRA</div>
        <button onClick={() => document.getElementById('login-modal').style.display = 'flex'}>Login</button>
      </header>

      {/* HERO */}
      <div style={{ background: '#0f172a', color: 'white', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1>Building the Future of Odisha</h1>
        <a href="https://forms.gle/v3keWBBpppa18k4Q8" target="_blank">
          <button style={{ padding: '10px 20px', fontSize: '1.2rem', background: '#f97316', border: 'none', color: 'white', cursor: 'pointer' }}>
            Request Quote
          </button>
        </a>
      </div>

      {/* LOGIN MODAL */}
      <div id="login-modal" style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '300px' }}>
          <h3>Portal Login</h3>
          <input 
            type="text" placeholder="Username" 
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" 
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={handleLogin} 
            disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#0f172a', color: 'white', border: 'none' }}
          >
            {loading ? 'Checking...' : 'Login'}
          </button>
          <p 
            onClick={() => document.getElementById('login-modal').style.display = 'none'} 
            style={{ textAlign: 'center', marginTop: '10px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Close
          </p>
        </div>
      </div>
    </div>
  );
}
