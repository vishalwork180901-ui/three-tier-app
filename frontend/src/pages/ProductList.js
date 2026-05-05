import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../api/products';
import { useAuth } from '../App';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home'];

const statusStyle = {
  active: { background:'#dcfce7', color:'#166534' },
  low:    { background:'#fef9c3', color:'#854d0e' },
  out:    { background:'#fee2e2', color:'#991b1b' },
};

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [page, setPage]             = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 6 };
      if (search)              params.search   = search;
      if (category !== 'All')  params.category = category;
      const { data } = await productAPI.getAll(params);
      setProducts(data.data);
      setTotal(data.total);
    } catch { setError('Failed to load products'); }
    finally   { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    await productAPI.remove(id);
    fetchProducts();
  }

  const totalPages = Math.ceil(total / 6);

  return (
    <div>
      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..." style={inputStyle} />
        <select value={category} onChange={e=>{ setCategory(e.target.value); setPage(1); }} style={inputStyle}>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
        {user && <Link to="/products/new" style={{ marginLeft:'auto', background:'#0ea5e9', color:'#fff', borderRadius:8, padding:'8px 18px', fontWeight:600, fontSize:14, display:'flex', alignItems:'center' }}>+ New Product</Link>}
      </div>

      {error   && <p style={{ color:'#dc2626', marginBottom:12 }}>{error}</p>}
      {loading && <p style={{ color:'#64748b' }}>Loading...</p>}

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 }}>
        {products.map(p => (
          <div key={p.id} style={cardStyle}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ fontSize:11, color:'#64748b', background:'#f1f5f9', borderRadius:4, padding:'2px 8px' }}>{p.category}</div>
              <span style={{ fontSize:11, borderRadius:20, padding:'2px 10px', fontWeight:600, ...statusStyle[p.status] }}>{p.status}</span>
            </div>
            <h3 style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{p.name}</h3>
            <p style={{ fontSize:12, color:'#64748b', marginBottom:12, minHeight:32 }}>{p.description || '—'}</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:20, fontWeight:700, color:'#0f172a' }}>₹{Number(p.price).toLocaleString()}</span>
              <span style={{ fontSize:12, color:'#64748b' }}>Stock: {p.stock}</span>
            </div>
            {user && (
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <Link to={`/products/${p.id}/edit`} style={{ flex:1, textAlign:'center', padding:'6px', borderRadius:6, border:'1px solid #e2e8f0', fontSize:12, color:'#0ea5e9' }}>Edit</Link>
                <button onClick={()=>handleDelete(p.id)} style={{ flex:1, padding:'6px', borderRadius:6, border:'1px solid #fecaca', fontSize:12, color:'#dc2626', background:'transparent' }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', gap:8, marginTop:24, justifyContent:'center' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={()=>setPage(n)} style={{ width:36, height:36, borderRadius:6, border:'1px solid #e2e8f0', background: n===page ? '#0ea5e9' : '#fff', color: n===page ? '#fff' : '#1e293b', fontWeight:600, fontSize:13 }}>{n}</button>
          ))}
        </div>
      )}
      <p style={{ textAlign:'center', color:'#94a3b8', fontSize:12, marginTop:12 }}>{total} products total</p>
    </div>
  );
}

const cardStyle = { background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:16, transition:'box-shadow .2s' };
const inputStyle = { padding:'8px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, outline:'none', background:'#fff' };
