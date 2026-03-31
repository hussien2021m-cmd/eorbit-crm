'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LOGO = 'data:image/png;base64,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';

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
    <div style={{
      minHeight: '100vh',
      background: '#08061A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position:'absolute', top:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(123,92,246,.18) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(67,97,238,.15) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'40%', left:'20%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,.1) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* Card */}
      <div style={{
        background: 'rgba(16,14,38,.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(130,100,255,.25)',
        borderRadius: 24,
        padding: '44px 40px',
        width: '100%',
        maxWidth: 420,
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 24px 80px rgba(0,0,0,.6)',
      }}>

        {/* Logo + Name */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:36, gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <img src={LOGO} alt="E-Orbit" style={{ width:56, height:56, borderRadius:14, objectFit:'cover' }} />
            <div style={{ fontSize:32, fontWeight:900, background:'linear-gradient(135deg,#9B7BFF,#6B8AFF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:2 }}>E-ORBIT</div>
          </div>
          <div style={{ fontSize:14, color:'rgba(164,159,200,.7)', letterSpacing:.5 }}>نظام إدارة السيلز</div>
          <div style={{ width:60, height:2, background:'linear-gradient(90deg,transparent,rgba(123,92,246,.6),transparent)', borderRadius:2 }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.25)', borderRadius:12, padding:'12px 16px', marginBottom:22, fontSize:14, color:'#FCA5A5', textAlign:'center' }}>
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:700, color:'rgba(164,159,200,.9)', marginBottom:8, display:'block' }}>اسم المستخدم</label>
            <input
              style={{
                background: 'rgba(24,22,51,.8)',
                border: '1px solid rgba(130,100,255,.2)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 15,
                color: '#F2EEFF',
                width: '100%',
                outline: 'none',
                direction: 'ltr',
                transition: 'border-color .2s',
              }}
              placeholder="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:700, color:'rgba(164,159,200,.9)', marginBottom:8, display:'block' }}>الباسورد</label>
            <input
              type="password"
              style={{
                background: 'rgba(24,22,51,.8)',
                border: '1px solid rgba(130,100,255,.2)',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 15,
                color: '#F2EEFF',
                width: '100%',
                outline: 'none',
                direction: 'ltr',
                transition: 'border-color .2s',
              }}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: loading ? 'rgba(123,92,246,.5)' : 'linear-gradient(135deg,#7B5CF6,#4361EE)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '15px',
              fontSize: 16,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 6,
              letterSpacing: .5,
              transition: 'opacity .2s',
              fontFamily: 'Cairo, sans-serif',
            }}
          >
            {loading ? '⏳ جاري الدخول...' : '🚀 دخول'}
          </button>
        </div>

        <div style={{ marginTop:28, fontSize:12, color:'rgba(95,91,128,.6)', textAlign:'center' }}>
          E-Orbit Performance Marketing © 2025
        </div>
      </div>
    </div>
  );
}
