'use client';

import { useState, useMemo } from 'react';
import { useLeads } from '@/hooks/useLeads';
import type { Lead, Stage, Status, Source, CreateLeadInput, UpdateLeadInput } from '@/types/lead';

const STAGES: { id: Stage; label: string; num: string; color: string }[] = [
  { id: 'leads',   label: 'جمع الـ Leads',    num: '01', color: '#4361EE' },
  { id: 'qualify', label: 'Qualify',           num: '02', color: '#7C5CF6' },
  { id: 'message', label: 'أول رسالة',         num: '03', color: '#A855F7' },
  { id: 'call',    label: 'Discovery Call',    num: '04', color: '#EC4899' },
  { id: 'audit',   label: 'Audit / Proposal',  num: '05', color: '#F97316' },
  { id: 'closing', label: 'Closing Call',      num: '06', color: '#22C55E' },
  { id: 'onboard', label: 'Onboarding',        num: '07', color: '#06B6D4' },
];

const SOURCES: Source[] = ['LinkedIn', 'Facebook Groups', 'Cold Scraping', 'Referral'];
const STATUSES: Status[] = ['New', 'Contacted', 'Qualified', 'Won', 'Lost', 'Archive'];

// موظفين السيلز — عدّل الأسماء دي حسب تيمك
const SALESPERSONS = ['محمد', 'اسراء', 'رحمة', 'هاجر', 'حسين'];

const STATUS_COLOR: Record<string, string> = {
  New: '#6B8AFF', Contacted: '#9B7BFF', Qualified: '#FB923C',
  Won: '#86EFAC', Lost: '#FCA5A5', Archive: '#9CA3AF',
};
const STATUS_BG: Record<string, string> = {
  New: 'rgba(67,97,238,.18)', Contacted: 'rgba(123,92,246,.18)', Qualified: 'rgba(249,115,22,.18)',
  Won: 'rgba(34,197,94,.18)', Lost: 'rgba(239,68,68,.18)', Archive: 'rgba(100,100,110,.18)',
};
const SOURCE_COLOR: Record<string, string> = {
  LinkedIn: '#6BA3D6', 'Facebook Groups': '#818CF8', 'Cold Scraping': '#9CA3AF', Referral: '#86EFAC',
};
const SOURCE_BG: Record<string, string> = {
  LinkedIn: 'rgba(10,102,194,.18)', 'Facebook Groups': 'rgba(79,91,200,.18)',
  'Cold Scraping': 'rgba(100,100,110,.18)', Referral: 'rgba(34,197,94,.18)',
};

type View = 'dashboard' | 'pipeline' | 'leads' | 'commission' | 'settings';

function fmtDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

const s = {
  app: { display: 'flex', minHeight: '100vh' } as React.CSSProperties,
  sidebar: { width: 240, background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 100 } as React.CSSProperties,
  main: { flex: 1, marginRight: 240, minHeight: '100vh', display: 'flex', flexDirection: 'column' } as React.CSSProperties,
  topbar: { height: 60, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 } as React.CSSProperties,
  content: { flex: 1, padding: 24, overflowY: 'auto' as const },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 } as React.CSSProperties,
  btnP: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--purple)', color: '#fff', fontFamily: 'Cairo, sans-serif' } as React.CSSProperties,
  btnS: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)', fontFamily: 'Cairo, sans-serif' } as React.CSSProperties,
  btnD: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'rgba(239,68,68,.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,.2)', fontFamily: 'Cairo, sans-serif' } as React.CSSProperties,
  input: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 14, color: 'var(--text)', fontFamily: 'Cairo, sans-serif', width: '100%', outline: 'none' } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 5, display: 'block' } as React.CSSProperties,
};

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  lead?: Lead | null;
  onClose: () => void;
  onSave: (data: CreateLeadInput | UpdateLeadInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

function LeadModal({ lead, onClose, onSave, onDelete }: ModalProps) {
  const isEdit = !!lead;
  const [form, setForm] = useState<CreateLeadInput>({
    name:        lead?.name        ?? '',
    company:     lead?.company     ?? '',
    phone:       lead?.phone       ?? '',
    email:       lead?.email       ?? '',
    source:      lead?.source      ?? 'LinkedIn',
    stage:       lead?.stage       ?? 'leads',
    status:      lead?.status      ?? 'New',
    budget:      lead?.budget      ?? '',
    salesperson: lead?.salesperson ?? '',
    notes:       lead?.notes       ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function set(k: keyof CreateLeadInput, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSave() {
    if (!form.name.trim()) { setErr('الاسم مطلوب'); return; }
    setLoading(true);
    try { await onSave(form); onClose(); } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'خطأ'); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm('هل تريد حذف هذا الـ Lead؟')) return;
    setLoading(true);
    try { await onDelete(); onClose(); } catch { setErr('فشل الحذف'); }
    finally { setLoading(false); }
  }

  const inp = (k: keyof CreateLeadInput, placeholder?: string, dir?: string) => (
    <input style={{ ...s.input, direction: (dir as 'ltr' | 'rtl') ?? 'rtl' }} placeholder={placeholder ?? ''} value={form[k] as string} onChange={e => set(k, e.target.value)} />
  );

  const sel = (k: keyof CreateLeadInput, opts: string[], withEmpty?: boolean) => (
    <select style={s.input} value={form[k] as string} onChange={e => set(k, e.target.value)}>
      {withEmpty && <option value="">— اختر —</option>}
      {opts.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--borderB)', borderRadius: 16, width: '100%', maxWidth: 580, maxHeight: '92vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700 }}>{isEdit ? 'تعديل Lead' : 'إضافة Lead جديد'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {err && <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#FCA5A5' }}>{err}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={s.label}>الاسم *</label>{inp('name', 'محمد أحمد')}</div>
          <div><label style={s.label}>الشركة</label>{inp('company', 'اسم الشركة')}</div>
          <div><label style={s.label}>التليفون</label>{inp('phone', '+201000000000', 'ltr')}</div>
          <div><label style={s.label}>البريد الإلكتروني</label>{inp('email', 'example@email.com', 'ltr')}</div>
          <div><label style={s.label}>المصدر</label>{sel('source', SOURCES)}</div>
          <div><label style={s.label}>الميزانية الشهرية</label>{inp('budget', 'مثال: 10,000 جنيه')}</div>

          {/* موظف السيلز */}
          <div style={{ gridColumn: '1 / -1', background: 'rgba(123,92,246,.07)', border: '1px solid var(--borderB)', borderRadius: 10, padding: 14 }}>
            <label style={{ ...s.label, color: 'var(--purpleL)', fontSize: 13 }}>👤 موظف السيلز المسؤول</label>
            <select style={s.input} value={form.salesperson} onChange={e => set('salesperson', e.target.value)}>
              <option value="">— اختر الموظف —</option>
              {SALESPERSONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div><label style={s.label}>المرحلة</label>
            <select style={s.input} value={form.stage} onChange={e => set('stage', e.target.value)}>
              {STAGES.map(st => <option key={st.id} value={st.id}>{st.num} · {st.label}</option>)}
            </select>
          </div>
          <div><label style={s.label}>الحالة</label>{sel('status', STATUSES)}</div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={s.label}>ملاحظات</label>
            <textarea style={{ ...s.input, resize: 'vertical', minHeight: 80 } as React.CSSProperties} placeholder="أي ملاحظات عن الـ lead..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)', marginTop: 8 }}>
          {isEdit && onDelete && <button style={s.btnD} onClick={handleDelete} disabled={loading}>🗑️ حذف</button>}
          <button style={s.btnS} onClick={onClose} disabled={loading}>إلغاء</button>
          <button style={{ ...s.btnP, opacity: loading ? .7 : 1 }} onClick={handleSave} disabled={loading}>
            {loading ? '...' : isEdit ? '💾 حفظ' : '➕ إضافة'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ leads }: { leads: Lead[] }) {
  const byStage = useMemo(() => {
    const m: Record<string, number> = {};
    STAGES.forEach(s => { m[s.id] = leads.filter(l => l.stage === s.id).length; });
    return m;
  }, [leads]);

  const won  = leads.filter(l => l.status === 'Won').length;
  const week = leads.filter(l => new Date(l.createdAt) >= new Date(Date.now() - 7 * 864e5)).length;
  const total = leads.length;

  const stats = [
    { label: 'إجمالي الـ Leads', value: total, sub: 'في الـ pipeline',    color: '#7B5CF6' },
    { label: 'هذا الأسبوع',      value: week,  sub: 'lead جديد',          color: '#4361EE' },
    { label: 'Audit / Proposal', value: byStage.audit ?? 0, sub: 'في مرحلة الـ Audit', color: '#F97316' },
    { label: 'Won ✅',            value: won,   sub: 'كلاينت تم الإغلاق', color: '#22C55E' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        {stats.map(st => (
          <div key={st.label} style={{ ...s.card, borderTop: `3px solid ${st.color}` }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>{st.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: st.color, lineHeight: 1, marginBottom: 4 }}>{st.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{st.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ ...s.card, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📊 معادلة الـ Pipeline</div>
        {STAGES.map(st => {
          const n = byStage[st.id] ?? 0;
          const pct = total > 0 ? Math.max(4, Math.round((n / total) * 100)) : 4;
          return (
            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text2)', minWidth: 140, textAlign: 'right' }}>{st.num} · {st.label}</div>
              <div style={{ flex: 1, height: 26, background: 'var(--bg3)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: st.color, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingLeft: 8, fontSize: 12, fontWeight: 700, color: '#fff', transition: 'width .5s' }}>
                  {n > 0 ? n : ''}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', minWidth: 24, textAlign: 'left' }}>{n}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={s.card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🏆 القواعد الذهبية</div>
          {[['01','الرقم أقوى من الكلام — ROAS 10x–17x'],['02','هدف الرسالة: كول. الكول: audit. الـ audit: closing'],['03','الـ Free Audit بيحول 30–40% لكلاينتس'],['04','Objection مش رفض — اسأل إيه تحديداً'],['05','الـ Pipeline لازم يتملى كل يوم بدون استثناء']].map(([n,t]) => (
            <div key={n} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
              <span style={{ color: 'var(--purpleL)', fontWeight: 700 }}>{n} </span>{t}
            </div>
          ))}
        </div>
        <div style={s.card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📈 الـ KPIs المستهدفة</div>
          {[['الـ Leads أسبوعياً','50+','#4361EE'],['Reply Rate','15–20%','#7C5CF6'],['Discovery Calls','3–5 / أسبوع','#EC4899'],['كلاينتس شهرياً','1–2','#22C55E']].map(([k,v,c]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{k}</span>
              <span style={{ fontWeight: 700, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

function Pipeline({ leads, onEdit }: { leads: Lead[]; onEdit: (l: Lead) => void }) {
  return (
    <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 16, minHeight: 'calc(100vh - 120px)' }}>
      {STAGES.map(stage => {
        const stageLeads = leads.filter(l => l.stage === stage.id);
        return (
          <div key={stage.id} style={{ flex: '0 0 240px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)' }}>
            <div style={{ padding: '13px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>{stage.label}</span>
              </div>
              <span style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 20, padding: '1px 7px', fontSize: 11, color: 'var(--text2)' }}>{stageLeads.length}</span>
            </div>
            <div style={{ flex: 1, padding: 10, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {stageLeads.length === 0
                ? <div style={{ padding: 18, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>لا يوجد leads</div>
                : stageLeads.map(lead => (
                  <div key={lead.id} onClick={() => onEdit(lead)}
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 13, cursor: 'pointer', transition: 'all .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--borderB)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--card2)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.background = 'var(--card)'; }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{lead.name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>{lead.company || '—'}</div>
                    {lead.salesperson && (
                      <div style={{ fontSize: 11, color: 'var(--purpleL)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>👤</span><span>{lead.salesperson}</span>
                      </div>
                    )}
                    {lead.budget && <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>💰 {lead.budget}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ background: SOURCE_BG[lead.source] ?? 'var(--bg3)', color: SOURCE_COLOR[lead.source] ?? 'var(--text2)', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{lead.source || '—'}</span>
                      <span style={{ fontSize: 10, color: 'var(--text3)' }}>{fmtDate(lead.createdAt)}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Leads Table ──────────────────────────────────────────────────────────────

function LeadsTable({ leads, onEdit }: { leads: Lead[]; onEdit: (l: Lead) => void }) {
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSP, setFilterSP] = useState('');

  const filtered = useMemo(() => leads.filter(l => {
    const q = search.toLowerCase();
    const mQ = !q || l.name?.toLowerCase().includes(q) || l.company?.toLowerCase().includes(q) || l.phone?.includes(q);
    const mS  = !filterStage  || l.stage       === filterStage;
    const mSt = !filterStatus || l.status      === filterStatus;
    const mSP = !filterSP     || l.salesperson === filterSP;
    return mQ && mS && mSt && mSP;
  }), [leads, search, filterStage, filterStatus, filterSP]);

  const selStyle: React.CSSProperties = { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: 'Cairo, sans-serif', fontSize: 13 };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input style={{ ...s.input, width: 200 }} placeholder="ابحث باسم أو شركة..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={selStyle} value={filterStage} onChange={e => setFilterStage(e.target.value)}>
            <option value="">كل المراحل</option>
            {STAGES.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
          </select>
          <select style={selStyle} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">كل الحالات</option>
            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <select style={selStyle} value={filterSP} onChange={e => setFilterSP(e.target.value)}>
            <option value="">كل الموظفين</option>
            {SALESPERSONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{filtered.length} lead</span>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', overflowX: 'auto' }}>
        {filtered.length === 0
          ? <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text3)' }}>لا يوجد leads مطابقة</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr>
                  {['الاسم','الشركة','التليفون','موظف السيلز','المرحلة','الحالة','الميزانية','تاريخ الإضافة',''].map(h => (
                    <th key={h} style={{ background: 'var(--bg3)', padding: '11px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => {
                  const stg = STAGES.find(s => s.id === lead.stage);
                  return (
                    <tr key={lead.id}>
                      <td style={{ padding: '11px 14px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{lead.name || '—'}</td>
                      <td style={{ padding: '11px 14px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{lead.company || '—'}</td>
                      <td style={{ padding: '11px 14px', color: 'var(--text2)', direction: 'ltr', borderBottom: '1px solid var(--border)' }}>{lead.phone || '—'}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                        {lead.salesperson
                          ? <span style={{ background: 'rgba(123,92,246,.15)', color: 'var(--purpleL)', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>👤 {lead.salesperson}</span>
                          : <span style={{ color: 'var(--text3)' }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: stg?.color ?? '#888', display: 'inline-block', flexShrink: 0 }} />
                          {stg?.label ?? lead.stage}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ background: STATUS_BG[lead.status] ?? 'var(--bg3)', color: STATUS_COLOR[lead.status] ?? 'var(--text2)', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{lead.status}</span>
                      </td>
                      <td style={{ padding: '11px 14px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{lead.budget || '—'}</td>
                      <td style={{ padding: '11px 14px', color: 'var(--text3)', fontSize: 12, borderBottom: '1px solid var(--border)' }}>{fmtDate(lead.createdAt)}</td>
                      <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                        <button style={{ ...s.btnS, padding: '5px 10px', fontSize: 12 }} onClick={() => onEdit(lead)}>تعديل</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
      </div>
    </div>
  );
}

// ─── Commission Report ────────────────────────────────────────────────────────

function CommissionReport({ leads }: { leads: Lead[] }) {
  const data = useMemo(() => {
    return SALESPERSONS.map(person => {
      const myLeads  = leads.filter(l => l.salesperson === person);
      const won      = myLeads.filter(l => l.status === 'Won');
      const inPipe   = myLeads.filter(l => !['Won','Lost','Archive'].includes(l.status));
      return { person, total: myLeads.length, won: won.length, inPipe: inPipe.length, lost: myLeads.filter(l => l.status === 'Lost').length };
    }).filter(d => d.total > 0);
  }, [leads]);

  const wonLeads = leads.filter(l => l.status === 'Won');

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {data.map(d => (
          <div key={d.person} style={{ ...s.card, borderTop: '3px solid var(--purple)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>👤</span><span>{d.person}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text3)' }}>إجمالي الـ Leads</span>
                <span style={{ fontWeight: 700 }}>{d.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text3)' }}>في الـ Pipeline</span>
                <span style={{ fontWeight: 700, color: '#6B8AFF' }}>{d.inPipe}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text3)' }}>Won ✅</span>
                <span style={{ fontWeight: 700, color: '#22C55E' }}>{d.won}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text3)' }}>Lost ❌</span>
                <span style={{ fontWeight: 700, color: '#EF4444' }}>{d.lost}</span>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div style={{ ...s.card, textAlign: 'center', color: 'var(--text3)', padding: 40 }}>
            لا يوجد بيانات بعد — ابدأ بإضافة leads وتعيين موظفين
          </div>
        )}
      </div>

      {/* Won deals table */}
      {wonLeads.length > 0 && (
        <div style={s.card}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏆</span><span>الـ Deals المغلقة (Won)</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
              <thead>
                <tr>
                  {['العميل','الشركة','الميزانية','موظف السيلز','تاريخ الإغلاق'].map(h => (
                    <th key={h} style={{ background: 'var(--bg3)', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text3)', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {wonLeads.map(lead => (
                  <tr key={lead.id}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{lead.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{lead.company || '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#22C55E', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>{lead.budget || '—'}</td>
                    <td style={{ padding: '11px 14px', borderBottom: '1px solid var(--border)' }}>
                      {lead.salesperson
                        ? <span style={{ background: 'rgba(123,92,246,.15)', color: 'var(--purpleL)', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>👤 {lead.salesperson}</span>
                        : <span style={{ color: 'var(--text3)' }}>—</span>
                      }
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--text3)', fontSize: 12, borderBottom: '1px solid var(--border)' }}>{fmtDate(lead.updatedAt || lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const { leads, isLoading, isError, addLead, editLead, removeLead, refresh } = useLeads();
  const [view, setView] = useState<View>('dashboard');
  const [modalLead, setModalLead] = useState<Lead | null | undefined>(undefined);

  const viewTitles: Record<View, string> = {
    dashboard:  'لوحة التحكم',
    pipeline:   'الـ Pipeline',
    leads:      'قائمة الـ Leads',
    commission: 'العمولات',
    settings:   'الإعدادات',
  };

  const navItems: { id: View; icon: string; label: string }[] = [
    { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
    { id: 'pipeline',   icon: '🔄', label: 'Pipeline' },
    { id: 'leads',      icon: '👥', label: 'الـ Leads' },
    { id: 'commission', icon: '💰', label: 'العمولات' },
    { id: 'settings',   icon: '⚙️', label: 'الإعدادات' },
  ];

  async function handleSave(data: CreateLeadInput | UpdateLeadInput) {
    if (modalLead) { await editLead(modalLead.id, data as UpdateLeadInput); }
    else { await addLead(data as CreateLeadInput); }
  }

  async function handleDelete() {
    if (modalLead) await removeLead(modalLead.id);
  }

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={{ padding: '18px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7B5CF6,#4361EE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🚀</div>
          <span style={{ fontSize: 17, fontWeight: 800, background: 'linear-gradient(135deg,#9B7BFF,#6B8AFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 1 }}>E-ORBIT</span>
        </div>
        <div style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, border: 'none', width: '100%', textAlign: 'right', fontFamily: 'Cairo, sans-serif', background: view === n.id ? 'rgba(123,92,246,.15)' : 'none', color: view === n.id ? 'var(--purpleL)' : 'var(--text2)', outline: view === n.id ? '1px solid var(--borderB)' : 'none' }}>
              <span style={{ fontSize: 15, minWidth: 20, textAlign: 'center' }}>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: 16, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.8 }}>
          E-Orbit Performance Marketing<br />نظام السيلز v1.0
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          <span style={{ fontSize: 17, fontWeight: 700 }}>{viewTitles[view]}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isLoading && <span style={{ fontSize: 12, color: 'var(--text3)' }}>⏳ جاري التحميل...</span>}
            {isError   && <span style={{ fontSize: 12, color: '#EF4444' }}>❌ خطأ في الاتصال</span>}
            <button style={s.btnS} onClick={() => refresh()}>↻ تحديث</button>
            <button style={s.btnP} onClick={() => setModalLead(null)}>+ Lead جديد</button>
          </div>
        </div>

        <div style={s.content}>
          {view === 'dashboard'  && <Dashboard        leads={leads} />}
          {view === 'pipeline'   && <Pipeline         leads={leads} onEdit={l => setModalLead(l)} />}
          {view === 'leads'      && <LeadsTable        leads={leads} onEdit={l => setModalLead(l)} />}
          {view === 'commission' && <CommissionReport  leads={leads} />}
          {view === 'settings'   && (
            <div>
              <div style={{ ...s.card, marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>👥 موظفو السيلز</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2, marginBottom: 12 }}>
                  الموظفين الحاليين في النظام:
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {SALESPERSONS.map(p => (
                    <span key={p} style={{ background: 'rgba(123,92,246,.15)', color: 'var(--purpleL)', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600 }}>👤 {p}</span>
                  ))}
                </div>
                <div style={{ background: 'rgba(123,92,246,.07)', border: '1px solid var(--borderB)', borderRadius: 8, padding: 14, fontSize: 13, color: 'var(--text2)' }}>
                  ⚙️ لتعديل أسماء الموظفين، افتح ملف <strong>app/page.tsx</strong> وعدّل قايمة <strong>SALESPERSONS</strong> في أول الملف
                </div>
              </div>
              <div style={s.card}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>🔗 حالة الاتصال</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2.2 }}>
                  <p>✅ الاتصال بـ Google Sheets شغال</p>
                  <p>✅ البيانات بتتحفظ أوتوماتيك</p>
                  <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 8 }}>إجمالي الـ Leads: <strong style={{ color: 'var(--purpleL)' }}>{leads.length}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalLead !== undefined && (
        <LeadModal lead={modalLead} onClose={() => setModalLead(undefined)} onSave={handleSave} onDelete={modalLead ? handleDelete : undefined} />
      )}
    </div>
  );
}
