'use client';
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Briefcase, 
  PieChart, 
  Activity,
  Menu,
  X,
  MapPin,
  ArrowUpRight,
  DollarSign,
  HardHat,
  Phone,
  LogOut,
  ShieldCheck,
  Globe
} from 'lucide-react';

// Firebase Imports (Uncomment and configure for real usage)
// import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// import { initializeApp } from "firebase/app";

const App = () => {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null); // Auth state: null = logged out, object = logged in
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auth Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('PHONE'); // 'PHONE' or 'OTP'
  const [loading, setLoading] = useState(false);

  // --- MOCK DATA (Bita Infra) ---
  const revenueStreams = [
    { name: 'Civil Construction', value: 45, color: 'bg-blue-600' },
    { name: 'Infrastructure Dev', value: 35, color: 'bg-sky-500' },
    { name: 'Govt. Contracts', value: 15, color: 'bg-indigo-500' },
    { name: 'Consultancy', value: 5, color: 'bg-teal-500' },
  ];

  const projects = [
    { id: 1, name: 'Highway NH-42 Expansion', type: 'Infrastructure', status: 'In Progress', completion: 72 },
    { id: 2, name: 'Bita Heights Residential', type: 'Residential', status: 'Planning', completion: 10 },
    { id: 3, name: 'City Center Mall', type: 'Commercial', status: 'Finishing', completion: 95 },
    { id: 4, name: 'State Power Grid Unit', type: 'Industrial', status: 'In Progress', completion: 45 },
  ];

  // --- AUTHENTICATION FUNCTIONS ---
  
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    
    // SIMULATION: In a real app, this connects to Firebase Auth
    console.log(`Sending OTP to +91 ${phoneNumber}...`);
    
    setTimeout(() => {
      setLoading(false);
      setStep('OTP');
      // For real app: window.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    }, 1500);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // SIMULATION: Verify OTP
    setTimeout(() => {
      setLoading(false);
      if (otp === '123456') { // Mock OTP for demo
        setUser({ name: 'Admin User', phone: phoneNumber, role: 'Admin' });
      } else {
        alert("Invalid OTP. (Try 123456)");
      }
    }, 1500);
  };

  const handleLogout = () => {
    setUser(null);
    setStep('PHONE');
    setPhoneNumber('');
    setOtp('');
  };

  // --- LOGIN SCREEN COMPONENT ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-500 rounded-full blur-[100px]"></div>
        </div>

        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-center text-white">
            <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold font-montserrat tracking-wide">BITA INFRA</h1>
            <p className="text-blue-200 text-sm mt-1">Enterprise Management Portal</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-400">
               <Globe size={10} />
               <span>bitainfra.com</span>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {step === 'PHONE' ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Mobile Number</label>
                  <div className="flex border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <div className="bg-slate-100 px-3 py-3 text-slate-500 font-medium border-r border-slate-300 flex items-center">
                      🇮🇳 +91
                    </div>
                    <input 
                      type="tel" 
                      placeholder="98765 43210"
                      className="w-full px-4 py-3 outline-none text-slate-800 font-medium placeholder:font-normal"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g,''))}
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30"
                >
                  {loading ? (
                    <span>Sending Code...</span>
                  ) : (
                    <>
                      <span>Continue Securely</span>
                      <ArrowUpRight size={18} />
                    </>
                  )}
                </button>
                <div id="recaptcha-container"></div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
                <div className="text-center mb-4">
                  <p className="text-slate-500 text-sm">Enter the code sent to</p>
                  <p className="font-bold text-slate-800 text-lg">+91 {phoneNumber}</p>
                  <button 
                    type="button" 
                    onClick={() => setStep('PHONE')} 
                    className="text-xs text-blue-600 hover:underline mt-1"
                  >
                    Change Number
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">One-Time Password (OTP)</label>
                  <input 
                    type="text" 
                    placeholder="123456"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus-border-transparent text-center text-2xl tracking-widest font-mono text-slate-800"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))}
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 text-center">Use '123456' for demo login</p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-600/30"
                >
                  {loading ? <span>Verifying...</span> : <span>Verify & Login</span>}
                </button>
              </form>
            )}

            <div className="mt-8 text-center border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck size={12} />
                Secure connection to bitainfra.com server
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD COMPONENTS ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Annual Revenue', value: '₹42.5 Cr', change: '+12%', icon: DollarSign, color: 'text-green-600' },
          { label: 'Active Projects', value: '18', change: '+3', icon: HardHat, color: 'text-orange-600' },
          { label: 'Total Workforce', value: '145', change: '+8%', icon: Users, color: 'text-blue-600' },
          { label: 'Growth Rate', value: '15.2%', change: '+0.8%', icon: TrendingUp, color: 'text-purple-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 flex items-center font-medium">
                <ArrowUpRight size={16} className="mr-1" />
                {stat.change}
              </span>
              <span className="text-slate-400 ml-2">vs last FY</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Diversification Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Revenue Distribution</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Detailed Report</button>
          </div>
          <div className="space-y-4">
            {revenueStreams.map((stream, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{stream.name}</span>
                  <span className="text-slate-500">{stream.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full ${stream.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${stream.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-lg text-white">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
             <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg flex items-center text-sm font-medium transition-colors">
                <Briefcase size={16} className="mr-3 text-sky-400"/> New Project Proposal
             </button>
             <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg flex items-center text-sm font-medium transition-colors">
                <Users size={16} className="mr-3 text-green-400"/> Employee Directory
             </button>
             <button className="w-full bg-white/10 hover:bg-white/20 p-3 rounded-lg flex items-center text-sm font-medium transition-colors">
                <Activity size={16} className="mr-3 text-purple-400"/> Site Reports
             </button>
          </div>
          <div className="mt-8 pt-4 border-t border-white/10">
             <p className="text-xs text-slate-400 mb-2">Connected Domain</p>
             <div className="flex items-center text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                bitainfra.com
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrgChart = () => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 overflow-x-auto min-h-[600px]">
      <div className="flex flex-col items-center min-w-[800px]">
        <h3 className="text-xl font-bold text-slate-800 mb-8">Bita Infra Structure</h3>
        {/* CEO */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="w-64 p-4 bg-slate-800 text-white rounded-lg shadow-lg text-center z-10 border-b-4 border-blue-500">
            <div className="font-bold text-lg">Managing Director</div>
            <div className="text-slate-300 text-sm">Head of Operations</div>
          </div>
          <div className="h-8 w-px bg-slate-300"></div>
        </div>
        {/* Level 2 */}
        <div className="flex justify-between w-full max-w-4xl px-10 relative">
           <div className="absolute top-0 left-20 right-20 h-px bg-slate-300"></div>
           <div className="absolute top-0 left-1/2 h-8 w-px bg-slate-300 -translate-x-1/2"></div>
           
           {/* Branch 1 */}
           <div className="flex flex-col items-center relative -top-8">
             <div className="h-8 w-px bg-slate-300"></div>
             <div className="w-48 p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-center">
                <div className="font-bold text-slate-800">Project Head</div>
                <div className="text-xs text-blue-600">Execution</div>
             </div>
           </div>
           
           {/* Branch 2 */}
           <div className="flex flex-col items-center">
             <div className="w-48 p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-center">
                <div className="font-bold text-slate-800">General Manager</div>
                <div className="text-xs text-blue-600">Admin & HR</div>
             </div>
           </div>

           {/* Branch 3 */}
           <div className="flex flex-col items-center relative -top-8">
             <div className="h-8 w-px bg-slate-300"></div>
             <div className="w-48 p-3 bg-white border border-slate-200 rounded-lg shadow-sm text-center">
                <div className="font-bold text-slate-800">Finance Head</div>
                <div className="text-xs text-blue-600">Accounts</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => (
        <div key={project.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                project.type === 'Residential' ? 'bg-blue-100 text-blue-700' :
                project.type === 'Commercial' ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {project.type}
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">{project.name}</h3>
            </div>
            <div className="p-2 bg-slate-50 rounded-full">
              <MapPin size={18} className="text-slate-400" />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-500">Completion</span>
              <span className="font-bold text-slate-700">{project.completion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${project.completion}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500 font-medium">Status: <span className="text-slate-800">{project.status}</span></span>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              View Site Data <ArrowUpRight size={14} className="ml-1" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // --- MAIN APP LAYOUT ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-wide">BITA INFRA</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Enterprise</p>
              </div>
            </div>
          ) : (
             <div className="bg-blue-600 p-2 rounded-lg mx-auto">
                <Building2 size={24} />
              </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { id: 'dashboard', label: 'Overview', icon: PieChart },
            { id: 'projects', label: 'Projects', icon: Briefcase },
            { id: 'org', label: 'Organization', icon: Users },
            { id: 'analytics', label: 'Reports', icon: Activity },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
           <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors mb-2"
           >
             {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
           </button>
           <button 
            onClick={handleLogout}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center'} p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors`}
           >
             <LogOut size={20} />
             {isSidebarOpen && <span className="ml-3 font-medium">Sign Out</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'dashboard' ? 'Executive Overview' : 
               activeTab === 'org' ? 'Corporate Structure' : 
               activeTab === 'projects' ? 'Project Portfolio' : 'Analytics Center'}
            </h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center">
               <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
               Logged in as: <span className="font-semibold ml-1 text-slate-700">{user.name}</span> ({user.role})
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
               <p className="text-xs text-slate-400">Current Date</p>
               <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'org' && renderOrgChart()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'analytics' && (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
              <Activity size={48} className="mb-4 opacity-50 text-blue-400" />
              <p className="text-lg font-medium text-slate-600">Analytics Module</p>
              <p className="text-sm">Connect your Google Analytics or ERP Data Source</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
