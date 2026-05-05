import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { authAPI } from './api/auth';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import Login from './pages/Login';

// ─── Auth Context ────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);
export function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.me().then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login  = async (data) => { const r = await authAPI.login(data);  localStorage.setItem('token', r.data.token); setUser(r.data.user); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',fontSize:14,color:'#64748b'}}>Loading...</div>;
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// ─── Layout ──────────────────────────────────────────────────────────────────
function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      <nav style={{ background:'#1e293b', padding:'12px 24px', display:'flex', alignItems:'center', gap:16 }}>
        <span style={{ color:'#38bdf8', fontWeight:700, fontSize:16 }}>◈ ProductApp</span>
        <Link to="/" style={{ color:'#94a3b8', fontSize:14 }}>Products</Link>
        {user && <Link to="/products/new" style={{ color:'#94a3b8', fontSize:14 }}>+ Add Product</Link>}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
          {user
            ? <><span style={{color:'#94a3b8',fontSize:13}}>{user.name}</span><button onClick={()=>{ logout(); navigate('/login'); }} style={{ background:'transparent', border:'1px solid #475569', color:'#94a3b8', borderRadius:6, padding:'4px 12px', fontSize:13 }}>Logout</button></>
            : <Link to="/login" style={{ background:'#0ea5e9', color:'#fff', borderRadius:6, padding:'5px 14px', fontSize:13 }}>Login</Link>
          }
        </div>
      </nav>
      <main style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>{children}</main>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><ProductList /></Layout>} />
          <Route path="/products/new" element={<Layout><ProductForm /></Layout>} />
          <Route path="/products/:id/edit" element={<Layout><ProductForm /></Layout>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
