'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAIAAAC2BqGFAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAA8C';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin() {
    if (!username || !password) { setError('ادخل اسم المستخدم والباسورد'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'خطأ في تسجيل الدخول'); return; }
      router.push('/');
      router.refresh();
    } catch { setError('خطأ في الاتصال'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'var(--bg2)', border:'1px solid rgba(130,100,255,.3)', borderRadius:20, padding:40, width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32, gap:12 }}>
          <img src={LOGO} alt="E-Orbit" style={{ width:72, height:72, borderRadius:18 }} />
          <div style={{ fontSize:28, fontWeight:900, background:'linear-gradient(135deg,#9B7BFF,#6B8AFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>E-ORBIT</div>
          <div style={{ fontSize:15, color:'var(--text2)' }}>نظام إدارة السيلز</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:14, color:'#FCA5A5', textAlign:'center' }}>
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:700, color:'var(--text2)', marginBottom:8, display:'block' }}>اسم المستخدم</label>
            <input
              style={{ background:'var(--bg3)', border:'1px solid rgba(130,100,255,.2)', borderRadius:10, padding:'13px 16px', fontSize:15, color:'var(--text)', width:'100%', outline:'none', direction:'ltr' }}
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:700, color:'var(--text2)', marginBottom:8, display:'block' }}>الباسورد</label>
            <input
              type="password"
              style={{ background:'var(--bg3)', border:'1px solid rgba(130,100,255,.2)', borderRadius:10, padding:'13px 16px', fontSize:15, color:'var(--text)', width:'100%', outline:'none', direction:'ltr' }}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background:'var(--purple)', color:'#fff', border:'none', borderRadius:10, padding:'14px', fontSize:16, fontWeight:700, cursor:'pointer', opacity: loading ? .7 : 1, marginTop:8 }}
          >
            {loading ? '⏳ جاري الدخول...' : '🚀 دخول'}
          </button>
        </div>

        <div style={{ marginTop:24, fontSize:12, color:'var(--text3)', textAlign:'center' }}>
          E-Orbit Performance Marketing
        </div>
      </div>
    </div>
  );
}
