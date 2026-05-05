import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI } from '../api/products';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home'];

export default function ProductForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);
  const [form, setForm]       = useState({ name:'', description:'', category:'Electronics', price:'', stock:'' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr, setApiErr]   = useState('');

  useEffect(() => {
    if (isEdit) {
      productAPI.getOne(id).then(r => {
        const { name, description, category, price, stock } = r.data;
        setForm({ name, description: description||'', category, price, stock });
      });
    }
  }, [id, isEdit]);

  function validate() {
    const e = {};
    if (!form.name.trim())          e.name  = 'Name is required';
    if (isNaN(form.price) || form.price < 0) e.price = 'Valid price required';
    if (isNaN(form.stock) || form.stock < 0) e.stock = 'Valid stock required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setApiErr('');
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) };
      isEdit ? await productAPI.update(id, payload) : await productAPI.create(payload);
      navigate('/');
    } catch (err) {
      setApiErr(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  }

  const field = (label, key, type='text', extra={}) => (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#475569', marginBottom:5, textTransform:'uppercase', letterSpacing:.5 }}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
        style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`1px solid ${errors[key]?'#f87171':'#e2e8f0'}`, fontSize:14, outline:'none' }}
        {...extra} />
      {errors[key] && <p style={{ color:'#dc2626', fontSize:12, marginTop:4 }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{ maxWidth:520, margin:'0 auto' }}>
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e2e8f0', padding:28 }}>
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24 }}>{isEdit ? 'Edit Product' : 'New Product'}</h2>
        {apiErr && <div style={{ background:'#fee2e2', color:'#991b1b', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:14 }}>{apiErr}</div>}
        <form onSubmit={handleSubmit}>
          {field('Product Name', 'name', 'text', { placeholder:'e.g. Wireless Headphones' })}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#475569', marginBottom:5, textTransform:'uppercase', letterSpacing:.5 }}>Category</label>
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }}>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          {field('Price (₹)', 'price', 'number', { placeholder:'0.00', min:0, step:'0.01' })}
          {field('Stock',     'stock', 'number', { placeholder:'0',    min:0 })}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#475569', marginBottom:5, textTransform:'uppercase', letterSpacing:.5 }}>Description</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}
              style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, outline:'none', resize:'vertical' }} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={()=>navigate('/')} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid #e2e8f0', background:'#f8fafc', color:'#64748b', fontWeight:600, fontSize:14 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex:2, padding:10, borderRadius:8, border:'none', background:'#0ea5e9', color:'#fff', fontWeight:600, fontSize:14 }}>
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
