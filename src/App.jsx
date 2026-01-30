import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ============================================
// STORAGE CONFIGURATION
// ============================================
// Using Supabase for real-time collaborative storage
// ============================================

const STORAGE_KEY = 'disney-family-trip-2026';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Storage helper functions (using Supabase)
const storage = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('trip_data')
        .select('data')
        .eq('id', key)
        .single();
      
      if (error || !data) return null;
      return { value: JSON.stringify(data.data) };
    } catch (e) {
      return null;
    }
  },
  async set(key, value) {
    try {
      const { error } = await supabase
        .from('trip_data')
        .upsert({ 
          id: key, 
          data: JSON.parse(value),
          updated_at: new Date().toISOString()
        });
      
      return error ? null : { success: true };
    } catch (e) {
      return null;
    }
  }
};

const defaultData = {
  tripInfo: { title: "Disney Family Trip 2026", dates: "June 22–28, 2026", groupSize: 15, password: "Disney2026" },
  lodging: { name: "", address: "", vrboLink: "", checkIn: "4:00 PM", checkOut: "10:00 AM", notes: "" },
  days: [
    { id: 1, date: "Sun, Jun 22", label: "Arrival Day", theme: "arrival", activities: [
      { text: "Check-in at VRBO", editedBy: null }, { text: "Grocery run for snacks & essentials", editedBy: null },
      { text: "Pool time to unwind", editedBy: null }, { text: "Optional: Disney Springs dinner", editedBy: null }
    ]},
    { id: 2, date: "Mon, Jun 23", label: "Animal Kingdom", theme: "park", activities: [
      { text: "Rope drop: Flight of Passage", editedBy: null }, { text: "Kilimanjaro Safari", editedBy: null },
      { text: "Key shows & character meets", editedBy: null }, { text: "Exit by 2-3pm → Pool break", editedBy: null },
      { text: "Dinner at VRBO or nearby", editedBy: null }
    ]},
    { id: 3, date: "Tue, Jun 24", label: "Hollywood Studios", theme: "park", activities: [
      { text: "Early entry: Rise of the Resistance", editedBy: null }, { text: "Slinky Dog Dash", editedBy: null },
      { text: "Midday pool break", editedBy: null }, { text: "Evening return for Fantasmic", editedBy: null }
    ]},
    { id: 4, date: "Wed, Jun 25", label: "EPCOT", theme: "park", activities: [
      { text: "Guardians of the Galaxy (if available)", editedBy: null }, { text: "Test Track / Frozen", editedBy: null },
      { text: "World Showcase exploration", editedBy: null }, { text: "Group dinner reservation", editedBy: null }
    ]},
    { id: 5, date: "Thu, Jun 26", label: "Magic Kingdom", theme: "park", activities: [
      { text: "Rope drop priorities", editedBy: null }, { text: "Classic rides & characters", editedBy: null },
      { text: "Midday break (highly recommended!)", editedBy: null }, { text: "Return for fireworks spectacular", editedBy: null }
    ]},
    { id: 6, date: "Fri, Jun 27", label: "Rest & Recharge", theme: "rest", activities: [
      { text: "Sleep in!", editedBy: null }, { text: "Pool day", editedBy: null },
      { text: "Mini golf or shopping", editedBy: null }, { text: "Early dinner, early bedtime", editedBy: null }
    ]},
    { id: 7, date: "Sat, Jun 28", label: "Departure", theme: "departure", activities: [
      { text: "Pack & checkout", editedBy: null }, { text: "Optional: quick park visit if time", editedBy: null },
      { text: "Safe travels home!", editedBy: null }
    ]}
  ],
  families: [],
  emergency: { hospital: "", pharmacy: "", emergencyContact: "", meetingSpot: "" },
  recommendations: [],
  announcements: [],
  editHistory: []
};

const themeColors = {
  arrival: { bg: '#667eea', icon: '✈️' },
  park: { bg: '#f5576c', icon: '🏰' },
  rest: { bg: '#4facfe', icon: '🏊' },
  departure: { bg: '#43e97b', icon: '🚗' }
};

// Glitter Rain
function GlitterRain({ active, onComplete }) {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (active) {
      const colors = ['#ffd700', '#ff69b4', '#87ceeb', '#dda0dd', '#98fb98', '#ffa500'];
      const p = [];
      for (let i = 0; i < 100; i++) {
        p.push({ id: i, x: Math.random() * 100, delay: Math.random() * 1.5, dur: 2 + Math.random() * 2, size: 4 + Math.random() * 6, color: colors[Math.floor(Math.random() * colors.length)] });
      }
      setParticles(p);
      setTimeout(() => onComplete?.(), 2500);
    }
  }, [active, onComplete]);
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1000 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: '-20px',
          width: p.size, height: p.size, background: p.color, borderRadius: '50%',
          boxShadow: `0 0 ${p.size}px ${p.color}`,
          animation: `fall ${p.dur}s ease-in ${p.delay}s forwards`, opacity: 0
        }} />
      ))}
      <style>{`@keyframes fall { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
    </div>
  );
}

// Magic Wand
function MagicWand({ active, position }) {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', left: position.x - 20, top: position.y - 50, pointerEvents: 'none', zIndex: 1001, animation: 'wand 0.6s ease-out' }}>
      <svg width="50" height="50" viewBox="0 0 60 60">
        <line x1="15" y1="45" x2="45" y2="15" stroke="#8b6914" strokeWidth="4" strokeLinecap="round" />
        <polygon points="45,5 47,12 54,12 49,17 51,24 45,20 39,24 41,17 36,12 43,12" fill="#ffd700" style={{ filter: 'drop-shadow(0 0 6px #ffd700)' }} />
      </svg>
      <style>{`@keyframes wand { 0% { transform: rotate(-20deg) scale(0.5); opacity: 0; } 50% { transform: rotate(10deg) scale(1.1); opacity: 1; } 100% { opacity: 0; } }`}</style>
    </div>
  );
}

// Floating Sparkles
function FloatingSparkles() {
  const [sparkles] = useState(() => {
    const colors = ['#ffd700', '#ff69b4', '#87ceeb', '#dda0dd'];
    return Array.from({ length: 15 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: 3 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)],
      dur: 4 + Math.random() * 4, delay: Math.random() * 5
    }));
  });
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {sparkles.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, background: s.color, borderRadius: '50%',
          boxShadow: `0 0 ${s.size * 2}px ${s.color}`, opacity: 0.5,
          animation: `sparkle ${s.dur}s ease-in-out ${s.delay}s infinite`
        }} />
      ))}
      <style>{`@keyframes sparkle { 0%, 100% { opacity: 0.3; transform: translateY(0) scale(1); } 50% { opacity: 0.7; transform: translateY(-10px) scale(1.2); } }`}</style>
    </div>
  );
}

// Castle
function MagicCastle({ size = 70 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ filter: 'drop-shadow(0 4px 12px rgba(102, 126, 234, 0.25))' }}>
      <defs><linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#667eea" /><stop offset="100%" stopColor="#764ba2" /></linearGradient></defs>
      <rect x="25" y="60" width="70" height="55" fill="url(#cg)" rx="2" />
      <rect x="15" y="40" width="20" height="75" fill="#667eea" rx="2" /><polygon points="25,40 10,20 40,20" fill="#ff69b4" /><circle cx="25" cy="15" r="4" fill="#ffd700" />
      <rect x="85" y="40" width="20" height="75" fill="#667eea" rx="2" /><polygon points="95,40 80,20 110,20" fill="#ff69b4" /><circle cx="95" cy="15" r="4" fill="#ffd700" />
      <rect x="50" y="25" width="20" height="50" fill="#764ba2" rx="2" /><polygon points="60,25 45,5 75,5" fill="#dda0dd" /><circle cx="60" cy="2" r="5" fill="#ffd700" />
      <path d="M50 115 L50 85 Q60 75 70 85 L70 115 Z" fill="#4a3728" />
    </svg>
  );
}

// User Badge
function UserBadge({ user, onLogout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8f4ff', borderRadius: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>{user.name.charAt(0).toUpperCase()}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer', padding: 0 }}>Switch User</button>
      </div>
    </div>
  );
}

// Draggable Activity Item
function DraggableActivity({ activity, index, onUpdate, onRemove, onDragStart, onDragOver, onDrop, isDragOver }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={(e) => e.target.style.opacity = '1'}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
        borderBottom: '1px solid #f5f5f5', cursor: 'grab',
        background: isDragOver ? '#f8f4ff' : 'transparent',
        borderRadius: isDragOver ? 8 : 0, transition: 'background 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 4px', cursor: 'grab', opacity: 0.4 }}>
        <div style={{ display: 'flex', gap: 2 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#999' }} /><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#999' }} /></div>
        <div style={{ display: 'flex', gap: 2 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#999' }} /><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#999' }} /></div>
        <div style={{ display: 'flex', gap: 2 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#999' }} /><div style={{ width: 4, height: 4, borderRadius: '50%', background: '#999' }} /></div>
      </div>
      <input type="text" value={typeof activity === 'string' ? activity : activity.text} onChange={(e) => onUpdate(index, e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, outline: 'none' }} placeholder="Enter activity..." />
      {activity.editedBy && <span style={{ fontSize: 11, color: '#888', background: '#f8f4ff', padding: '4px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>{activity.editedBy}</span>}
      <button onClick={() => onRemove(index)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fff0f0', color: '#f5576c', fontSize: 18, cursor: 'pointer' }}>×</button>
    </div>
  );
}

// Family Accordion
function FamilyAccordion({ family, isOpen, onToggle, onUpdateMember, onAddMember, onRemoveMember, onRemoveFamily, currentUser }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderLeft: '4px solid #667eea', cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#4a4a6a' }}>{family.lastName} Family</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{family.members.length} {family.members.length === 1 ? 'member' : 'members'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={(e) => { e.stopPropagation(); onRemoveFamily(family.id); }} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fff0f0', color: '#f5576c', fontSize: 18, cursor: 'pointer' }}>×</button>
          <span style={{ color: '#888', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 12 }}>▼</span>
        </div>
      </div>
      {isOpen && (
        <div style={{ padding: '24px', borderTop: '1px solid #f0f0f0' }}>
          {family.members.map((member, idx) => (
            <div key={member.id} style={{ background: '#fafafa', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#764ba2' }}>Member #{idx + 1}</span>
                {member.addedBy && <span style={{ fontSize: 11, color: '#888' }}>Added by {member.addedBy}</span>}
                <button onClick={() => onRemoveMember(family.id, member.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fff0f0', color: '#f5576c', fontSize: 16, cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>First Name</label><input type="text" value={member.firstName || ''} onChange={e => onUpdateMember(family.id, member.id, 'firstName', e.target.value)} placeholder="First name" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Last Name</label><input type="text" value={member.lastName || ''} onChange={e => onUpdateMember(family.id, member.id, 'lastName', e.target.value)} placeholder="Last name" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Birthdate</label><input type="date" value={member.birthdate || ''} onChange={e => onUpdateMember(family.id, member.id, 'birthdate', e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} /></div>
                <div><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Phone Number</label><input type="tel" value={member.phone || ''} onChange={e => onUpdateMember(family.id, member.id, 'phone', e.target.value)} placeholder="(555) 123-4567" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} /></div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Emergency Contact (Not on trip)</label>
                <input type="text" value={member.emergencyContact || ''} onChange={e => onUpdateMember(family.id, member.id, 'emergencyContact', e.target.value)} placeholder="Name & phone of someone not traveling" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Other Important Info</label>
                <textarea value={member.otherInfo || ''} onChange={e => onUpdateMember(family.id, member.id, 'otherInfo', e.target.value)} placeholder="Dietary restrictions, medical info, allergies, special needs..." style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
            </div>
          ))}
          <button onClick={() => onAddMember(family.id)} style={{ width: '100%', padding: 14, borderRadius: 10, border: '2px dashed #e8e0f0', background: '#fafafa', color: '#888', fontSize: 14, cursor: 'pointer' }}>+ Add Family Member</button>
        </div>
      )}
    </div>
  );
}

// Accordion Day
function AccordionDay({ day, isOpen, onToggle, onUpdate, onAdd, onRemove, onReorder, currentUser }) {
  const theme = themeColors[day.theme] || themeColors.park;
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  const handleDragStart = (e, index) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = 'move'; e.target.style.opacity = '0.5'; };
  const handleDragOver = (e, index) => { e.preventDefault(); if (draggedIndex !== null && draggedIndex !== index) setDragOverIndex(index); };
  const handleDrop = (e, dropIndex) => { e.preventDefault(); if (draggedIndex !== null && draggedIndex !== dropIndex) onReorder(draggedIndex, dropIndex); setDraggedIndex(null); setDragOverIndex(null); };
  
  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} onDragLeave={() => setDragOverIndex(null)}>
      <button onClick={onToggle} style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: 'none', borderLeft: `4px solid ${theme.bg}`, cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 28 }}>{theme.icon}</span>
          <div><div style={{ fontSize: 13, color: '#888' }}>{day.date}</div><div style={{ fontSize: 18, fontWeight: 600, color: '#4a4a6a' }}>{day.label}</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#888', background: '#f5f5f5', padding: '4px 10px', borderRadius: 20 }}>{day.activities.length} activities</span>
          <span style={{ color: '#888', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 12 }}>▼</span>
        </div>
      </button>
      {isOpen && (
        <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 12, color: '#888', padding: '12px 0 8px' }}>Drag items to reorder</div>
          {day.activities.map((act, idx) => (
            <DraggableActivity key={idx} activity={act} index={idx} onUpdate={onUpdate} onRemove={onRemove} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} isDragOver={dragOverIndex === idx} />
          ))}
          <button onClick={onAdd} style={{ width: '100%', padding: 14, borderRadius: 10, border: '2px dashed #e8e0f0', background: '#fafafa', color: '#888', fontSize: 14, cursor: 'pointer', marginTop: 12 }}>+ Add Activity</button>
        </div>
      )}
    </div>
  );
}

// History Item
function HistoryItem({ edit }) {
  const timeAgo = (date) => {
    const s = Math.floor((new Date() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>{edit.user.charAt(0).toUpperCase()}</div>
      <div style={{ flex: 1 }}><span style={{ fontWeight: 600 }}>{edit.user}</span> <span style={{ color: '#666' }}>{edit.action}</span></div>
      <span style={{ color: '#aaa', fontSize: 13 }}>{timeAgo(edit.time)}</span>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [lastSaved, setLastSaved] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showGlitter, setShowGlitter] = useState(false);
  const [showWand, setShowWand] = useState(false);
  const [wandPosition, setWandPosition] = useState({ x: 0, y: 0 });
  const [unlockComplete, setUnlockComplete] = useState(false);
  const [openDays, setOpenDays] = useState([1]);
  const [openFamilies, setOpenFamilies] = useState([]);
  const [showAddFamilyForm, setShowAddFamilyForm] = useState(false);
  const [newFamilyLastName, setNewFamilyLastName] = useState('');
  const [step, setStep] = useState('password');
  const btnRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await storage.get(STORAGE_KEY);
        if (r?.value) {
          const p = JSON.parse(r.value);
          p.days = p.days.map(d => ({ ...d, activities: d.activities.map(a => typeof a === 'string' ? { text: a, editedBy: null } : a) }));
          setData(p);
        } else {
          setData(defaultData);
          await storage.set(STORAGE_KEY, JSON.stringify(defaultData));
        }
      } catch { setData(defaultData); }
      setLoading(false);
    }
    load();

    // Real-time sync - updates when others make changes
    const channel = supabase
      .channel('trip-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'trip_data' },
        (payload) => {
          if (payload.new.id === STORAGE_KEY) {
            const updatedData = payload.new.data;
            updatedData.days = updatedData.days.map(d => ({ 
              ...d, 
              activities: d.activities.map(a => typeof a === 'string' ? { text: a, editedBy: null } : a) 
            }));
            setData(updatedData);
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trip_data' },
        (payload) => {
          if (payload.new.id === STORAGE_KEY) {
            const newData = payload.new.data;
            newData.days = newData.days.map(d => ({ 
              ...d, 
              activities: d.activities.map(a => typeof a === 'string' ? { text: a, editedBy: null } : a) 
            }));
            setData(newData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const save = useCallback(async (d) => {
    setSaving(true);
    try { await storage.set(STORAGE_KEY, JSON.stringify(d)); setLastSaved(new Date()); } catch {}
    setSaving(false);
  }, []);

  useEffect(() => {
    if (data && !loading && currentUser) {
      const t = setTimeout(() => save(data), 1000);
      return () => clearTimeout(t);
    }
  }, [data, loading, save, currentUser]);

  const addHistory = (action) => {
    if (!currentUser) return;
    setData(p => ({ ...p, editHistory: [{ user: currentUser.name, action, time: new Date().toISOString() }, ...(p.editHistory || []).slice(0, 49)] }));
  };

  const handlePassword = () => {
    if (passwordInput === 'Disney2026' || passwordInput === data?.tripInfo?.password) { setPasswordError(false); setStep('name'); }
    else setPasswordError(true);
  };

  const handleName = () => {
    if (!nameInput.trim()) return;
    if (btnRef.current) { const r = btnRef.current.getBoundingClientRect(); setWandPosition({ x: r.left + r.width / 2, y: r.top }); }
    setCurrentUser({ name: nameInput.trim() });
    setShowWand(true);
    setTimeout(() => setShowGlitter(true), 200);
  };

  const handleGlitterDone = () => { setUnlockComplete(true); setTimeout(() => setIsUnlocked(true), 400); };
  const logout = () => { setCurrentUser(null); setIsUnlocked(false); setStep('password'); setPasswordInput(''); setNameInput(''); setUnlockComplete(false); };

  const updateDay = (dayId, idx, val) => {
    setData(p => ({ ...p, days: p.days.map(d => d.id === dayId ? { ...d, activities: d.activities.map((a, i) => i === idx ? { text: val, editedBy: currentUser?.name } : a) } : d) }));
    addHistory(`edited ${data.days.find(d => d.id === dayId)?.label}`);
  };
  const addActivity = (dayId) => {
    setData(p => ({ ...p, days: p.days.map(d => d.id === dayId ? { ...d, activities: [...d.activities, { text: '', editedBy: currentUser?.name }] } : d) }));
    addHistory(`added activity to ${data.days.find(d => d.id === dayId)?.label}`);
  };
  const removeActivity = (dayId, idx) => {
    setData(p => ({ ...p, days: p.days.map(d => d.id === dayId ? { ...d, activities: d.activities.filter((_, i) => i !== idx) } : d) }));
    addHistory(`removed activity from ${data.days.find(d => d.id === dayId)?.label}`);
  };
  const reorderActivities = (dayId, fromIndex, toIndex) => {
    setData(p => ({
      ...p,
      days: p.days.map(d => {
        if (d.id === dayId) {
          const newActivities = [...d.activities];
          const [movedItem] = newActivities.splice(fromIndex, 1);
          movedItem.editedBy = currentUser?.name;
          newActivities.splice(toIndex, 0, movedItem);
          return { ...d, activities: newActivities };
        }
        return d;
      })
    }));
    addHistory(`reordered activities in ${data.days.find(d => d.id === dayId)?.label}`);
  };

  // Migrate old contacts structure to families if needed
  useEffect(() => {
    if (data && data.contacts && Array.isArray(data.contacts) && data.contacts.length > 0 && (!data.families || data.families.length === 0)) {
      const familiesMap = new Map();
      data.contacts.forEach(contact => {
        // Try to extract last name from name field, or use "Unknown" as default
        const nameParts = (contact.name || '').trim().split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Unknown';
        const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
        
        if (!familiesMap.has(lastName)) {
          familiesMap.set(lastName, {
            id: `family-${Date.now()}-${Math.random()}`,
            lastName: lastName,
            members: []
          });
        }
        
        const family = familiesMap.get(lastName);
        family.members.push({
          id: contact.id || Date.now(),
          firstName: firstName,
          lastName: lastName,
          phone: contact.phone || '',
          birthdate: '',
          emergencyContact: '',
          otherInfo: (contact.notes || '') + (contact.email ? ` Email: ${contact.email}` : '') + (contact.room ? ` Room: ${contact.room}` : ''),
          addedBy: contact.addedBy
        });
      });
      
      setData(p => {
        const newData = {
          ...p,
          families: Array.from(familiesMap.values())
        };
        delete newData.contacts; // Remove old contacts
        return newData;
      });
      if (currentUser) {
        addHistory('migrated contacts to families');
      }
    }
  }, [data, currentUser]);

  const addFamily = (lastName) => {
    if (!lastName.trim()) return;
    setData(p => ({
      ...p,
      families: [...(p.families || []), {
        id: `family-${Date.now()}`,
        lastName: lastName.trim(),
        members: []
      }]
    }));
    addHistory(`added ${lastName.trim()} family`);
  };

  const removeFamily = (familyId) => {
    setData(p => ({
      ...p,
      families: (p.families || []).filter(f => f.id !== familyId)
    }));
    addHistory('removed family');
  };

  const addFamilyMember = (familyId) => {
    setData(p => ({
      ...p,
      families: (p.families || []).map(f => 
        f.id === familyId 
          ? { ...f, members: [...f.members, { id: Date.now(), firstName: '', lastName: f.lastName, phone: '', birthdate: '', emergencyContact: '', otherInfo: '', addedBy: currentUser?.name }] }
          : f
      )
    }));
    addHistory('added family member');
  };

  const removeFamilyMember = (familyId, memberId) => {
    setData(p => ({
      ...p,
      families: (p.families || []).map(f =>
        f.id === familyId
          ? { ...f, members: f.members.filter(m => m.id !== memberId) }
          : f
      )
    }));
    addHistory('removed family member');
  };

  const updateFamilyMember = (familyId, memberId, field, value) => {
    setData(p => ({
      ...p,
      families: (p.families || []).map(f =>
        f.id === familyId
          ? {
              ...f,
              members: f.members.map(m =>
                m.id === memberId
                  ? { ...m, [field]: value, lastEditedBy: currentUser?.name }
                  : m
              )
            }
          : f
      )
    }));
  };

  const addRec = (r) => { setData(p => ({ ...p, recommendations: [...p.recommendations, { id: Date.now(), ...r, votes: 0, addedBy: currentUser?.name, voters: [] }] })); addHistory(`added tip: ${r.title}`); };
  const voteRec = (id) => { setData(p => ({ ...p, recommendations: p.recommendations.map(r => r.id === id && !(r.voters || []).includes(currentUser?.name) ? { ...r, votes: r.votes + 1, voters: [...(r.voters || []), currentUser?.name] } : r) })); };
  const addAnn = (text) => { setData(p => ({ ...p, announcements: [{ id: Date.now(), text, author: currentUser?.name, time: new Date().toISOString() }, ...p.announcements] })); addHistory('posted announcement'); };
  const updateField = (path, val, desc) => { setData(p => { const d = JSON.parse(JSON.stringify(p)); const k = path.split('.'); let c = d; for (let i = 0; i < k.length - 1; i++) c = c[k[i]]; c[k[k.length - 1]] = val; return d; }); if (desc) addHistory(desc); };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #fdf6f9, #f0e6ff)' }}>
      <MagicCastle size={90} />
      <p style={{ marginTop: 20, color: '#764ba2' }}>✨ Loading magic... ✨</p>
    </div>
  );

  if (!isUnlocked) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #fdf6f9 0%, #e8f4f8 50%, #f0e6ff 100%)', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <FloatingSparkles />
      <MagicWand active={showWand} position={wandPosition} />
      <GlitterRain active={showGlitter} onComplete={handleGlitterDone} />
      <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(102,126,234,0.15)', maxWidth: 420, width: '100%', ...(unlockComplete ? { animation: 'fadeOut 0.4s forwards' } : {}) }}>
        <MagicCastle size={80} />
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#4a4a6a', margin: '16px 0 8px' }}>✨ Disney Family Trip ✨</h1>
        {step === 'password' ? (<>
          <p style={{ color: '#764ba2', margin: '0 0 20px' }}>Enter the magic words</p>
          <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePassword()} placeholder="Family password..." style={{ width: '100%', padding: '16px 20px', borderRadius: 12, border: '2px solid #e8e0f0', fontSize: 16, textAlign: 'center', marginBottom: 12, boxSizing: 'border-box' }} />
          <button onClick={handlePassword} style={{ width: '100%', padding: '16px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Continue ✨</button>
          {passwordError && <p style={{ color: '#f5576c', marginTop: 12 }}>🪄 Wrong spell! Try again.</p>}
          <p style={{ color: '#aaa', fontSize: 13, marginTop: 16 }}>💫 Hint: Magic word + year</p>
        </>) : (<>
          <p style={{ color: '#764ba2', margin: '0 0 8px' }}>Welcome! What's your name?</p>
          <p style={{ color: '#888', fontSize: 14, margin: '0 0 20px' }}>So everyone knows who made changes</p>
          <input type="text" value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleName()} placeholder="Your name..." style={{ width: '100%', padding: '16px 20px', borderRadius: 12, border: '2px solid #e8e0f0', fontSize: 16, textAlign: 'center', marginBottom: 12, boxSizing: 'border-box' }} />
          <button ref={btnRef} onClick={handleName} style={{ width: '100%', padding: '16px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Enter the Kingdom! 🏰</button>
        </>)}
      </div>
      <style>{`@keyframes fadeOut { to { opacity: 0; transform: scale(1.05); } }`}</style>
    </div>
  );

  const tabs = [{ id: 'itinerary', label: 'Itinerary', icon: '' }, { id: 'contacts', label: 'Family', icon: '' }, { id: 'lodging', label: 'Lodging', icon: '' }, { id: 'tips', label: 'Tips', icon: '' }, { id: 'emergency', label: 'Emergency', icon: '' }, { id: 'history', label: 'Activity', icon: '' }];
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
  const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: 80, fontFamily: 'inherit' };
  const cardStyle = { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };
  const btnPrimary = { padding: '12px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' };
  const btnSecondary = { padding: '12px 20px', borderRadius: 10, border: '1px solid #e8e0f0', background: '#fff', color: '#666', fontWeight: 500, fontSize: 14, cursor: 'pointer' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fdf6f9 0%, #fff 15%, #fff 85%, #f0e6ff 100%)', fontFamily: 'system-ui, sans-serif', color: '#4a4a6a' }}>
      <FloatingSparkles />
      <header style={{ background: '#fff', borderBottom: '1px solid #f0e6ff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><MagicCastle size={45} /><div><h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{data.tripInfo.title}</h1><p style={{ margin: '2px 0 0', color: '#764ba2', fontSize: 13 }}>✨ {data.tripInfo.dates} ✨</p></div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saving ? <span style={{ padding: '6px 12px', borderRadius: 20, background: '#fff7e6', color: '#d48806', fontSize: 13 }}>💾 Saving...</span> : lastSaved && <span style={{ padding: '6px 12px', borderRadius: 20, background: '#f6ffed', color: '#52c41a', fontSize: 13 }}>✓ Saved</span>}
          <UserBadge user={currentUser} onLogout={logout} />
        </div>
      </header>

      {data.announcements.length > 0 && <div style={{ background: 'linear-gradient(90deg, #fff7e6, #fffbe6)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #ffe58f', position: 'relative', zIndex: 10 }}><span style={{ flex: 1, color: '#d48806' }}>{data.announcements[0].text}</span><span style={{ color: '#888', fontSize: 13 }}>— {data.announcements[0].author}</span></div>}

      <nav style={{ display: 'flex', gap: 8, padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0e6ff', overflowX: 'auto', position: 'relative', zIndex: 10 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '1px solid #e8e0f0', background: activeTab === t.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#fff', color: activeTab === t.id ? '#fff' : '#666', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeTab === t.id ? 600 : 400 }}><span>{t.label}</span></button>)}
      </nav>

      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {activeTab === 'itinerary' && <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Trip Itinerary</h2>
            <button onClick={() => setOpenDays(openDays.length === 7 ? [] : [1,2,3,4,5,6,7])} style={btnSecondary}>{openDays.length === 7 ? 'Collapse All' : 'Expand All'}</button>
          </div>
          <p style={{ color: '#888', marginBottom: 24 }}>Click to expand • Drag to reorder • Your name is tracked!</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.days.map(d => (
              <AccordionDay key={d.id} day={d} isOpen={openDays.includes(d.id)} onToggle={() => setOpenDays(p => p.includes(d.id) ? p.filter(x => x !== d.id) : [...p, d.id])} onUpdate={(i, v) => updateDay(d.id, i, v)} onAdd={() => addActivity(d.id)} onRemove={(i) => removeActivity(d.id, i)} onReorder={(from, to) => reorderActivities(d.id, from, to)} currentUser={currentUser} />
            ))}
          </div>
        </div>}

        {activeTab === 'contacts' && <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Families</h2>
            <button onClick={() => setShowAddFamilyForm(true)} style={btnPrimary}>+ Add Family</button>
          </div>
          <p style={{ color: '#888', marginBottom: 24 }}>Group family members by last name</p>
          
          {showAddFamilyForm && (
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Family Last Name</label>
                  <input 
                    type="text" 
                    value={newFamilyLastName} 
                    onChange={e => setNewFamilyLastName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newFamilyLastName.trim()) {
                        addFamily(newFamilyLastName);
                        setNewFamilyLastName('');
                        setShowAddFamilyForm(false);
                      }
                    }}
                    placeholder="e.g., Rhodes, Alward..." 
                    style={inputStyle}
                    autoFocus
                  />
                </div>
                <button 
                  onClick={() => {
                    if (newFamilyLastName.trim()) {
                      addFamily(newFamilyLastName);
                      setNewFamilyLastName('');
                      setShowAddFamilyForm(false);
                    }
                  }} 
                  style={btnPrimary}
                >
                  Create Family
                </button>
                <button 
                  onClick={() => {
                    setShowAddFamilyForm(false);
                    setNewFamilyLastName('');
                  }} 
                  style={btnSecondary}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.families || []).map(family => (
              <FamilyAccordion
                key={family.id}
                family={family}
                isOpen={openFamilies.includes(family.id)}
                onToggle={() => setOpenFamilies(p => p.includes(family.id) ? p.filter(id => id !== family.id) : [...p, family.id])}
                onUpdateMember={updateFamilyMember}
                onAddMember={addFamilyMember}
                onRemoveMember={removeFamilyMember}
                onRemoveFamily={removeFamily}
                currentUser={currentUser}
              />
            ))}
            {(!data.families || data.families.length === 0) && !showAddFamilyForm && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888', background: '#fff', borderRadius: 16 }}>
                <p>No families yet. Click "Add Family" to get started!</p>
              </div>
            )}
          </div>
        </div>}

        {activeTab === 'lodging' && <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Our Home Base</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Where we're staying!</p>
          <div style={cardStyle}>
            {[{ k: 'name', l: 'Property Name', p: 'e.g., Magical Villa' }, { k: 'address', l: 'Address', p: '123 Magic Way, Kissimmee, FL' }, { k: 'vrboLink', l: 'VRBO Link', p: 'https://vrbo.com/...' }].map(f => <div key={f.k} style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>{f.l}</label><input type="text" value={data.lodging[f.k]} onChange={e => updateField(`lodging.${f.k}`, e.target.value, `updated ${f.l}`)} placeholder={f.p} style={inputStyle} /></div>)}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {['checkIn', 'checkOut'].map(f => <div key={f}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>{f === 'checkIn' ? 'Check-in' : 'Check-out'}</label><input type="text" value={data.lodging[f]} onChange={e => updateField(`lodging.${f}`, e.target.value)} style={inputStyle} /></div>)}
            </div>
            <div><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>Notes</label><textarea value={data.lodging.notes} onChange={e => updateField('lodging.notes', e.target.value, 'updated lodging notes')} placeholder="Gate code, wifi..." style={textareaStyle} /></div>
            {data.lodging.address && <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.lodging.address)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Open Maps</a>{data.lodging.vrboLink && <a href={data.lodging.vrboLink} target="_blank" rel="noopener noreferrer" style={{ ...btnSecondary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>View Listing</a>}</div>}
          </div>
        </div>}

        {activeTab === 'tips' && <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Tips & Recommendations</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Share your Disney wisdom! Vote on favorites.</p>
          <RecForm onAdd={addRec} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.recommendations.sort((a, b) => b.votes - a.votes).map(r => <div key={r.id} style={{ ...cardStyle, display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><button onClick={() => voteRec(r.id)} disabled={(r.voters || []).includes(currentUser?.name)} style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid #ffe58f', background: '#fffbe6', fontSize: 20, cursor: 'pointer', opacity: (r.voters || []).includes(currentUser?.name) ? 0.5 : 1 }}>⭐</button><span style={{ fontWeight: 700, color: '#d48806' }}>{r.votes}</span></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>{r.category}</div><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{r.title}</div>{r.description && <div style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>{r.description}</div>}<div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>Added by {r.addedBy}</div></div>
            </div>)}
            {data.recommendations.length === 0 && <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}><p>No tips yet!</p></div>}
          </div>
          <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #f0e6ff' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Announcements</h3>
            <AnnForm onAdd={addAnn} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{data.announcements.map(a => <div key={a.id} style={{ background: '#f8f4ff', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 14, marginBottom: 8 }}>{a.text}</div><div style={{ fontSize: 12, color: '#888' }}>{a.author} • {new Date(a.time).toLocaleDateString()}</div></div>)}</div>
          </div>
        </div>}

        {activeTab === 'emergency' && <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Emergency Info</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Important contacts!</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
            {[{ k: 'hospital', l: 'Nearest Hospital' }, { k: 'pharmacy', l: 'Pharmacy' }, { k: 'emergencyContact', l: 'Emergency Contact' }, { k: 'meetingSpot', l: 'Meeting Spot' }].map(f => <div key={f.k} style={cardStyle}><label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>{f.l}</label><input type="text" value={data.emergency[f.k]} onChange={e => updateField(`emergency.${f.k}`, e.target.value, `updated ${f.l}`)} placeholder={`Enter ${f.l.toLowerCase()}`} style={inputStyle} /></div>)}
          </div>
          <div style={{ background: '#f8f4ff', borderRadius: 16, padding: 24 }}><h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Daily Checklist</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>{['Sunscreen & hats', 'Chargers', 'Water bottles', 'Snacks', 'Tickets', 'Comfy shoes', 'Ponchos', 'First aid'].map((it, i) => <div key={i} style={{ background: '#fff', padding: '12px 16px', borderRadius: 10, fontSize: 14 }}>{it}</div>)}</div></div>
        </div>}

        {activeTab === 'history' && <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Recent Activity</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>See who made changes!</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.editHistory || []).map((e, i) => <HistoryItem key={i} edit={e} />)}
            {(!data.editHistory || data.editHistory.length === 0) && <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}><p>No activity yet!</p></div>}
          </div>
        </div>}
      </main>

      <footer style={{ textAlign: 'center', padding: '32px 24px', color: '#888', fontSize: 14, position: 'relative', zIndex: 10 }}>
        <p>✨ May your Disney dreams come true! ✨</p>
        <button onClick={() => window.location.reload()} style={{ ...btnSecondary, marginTop: 12 }}>Refresh for updates</button>
      </footer>
    </div>
  );
}

function RecForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('Restaurant');
  const submit = () => { if (!title.trim()) return; onAdd({ title, description: desc, category: cat }); setTitle(''); setDesc(''); };
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <select value={cat} onChange={e => setCat(e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, background: '#fff' }}>{['Restaurant', 'Ride', 'Show', 'Snack', 'Photo Spot', 'Pro Tip'].map(c => <option key={c}>{c}</option>)}</select>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Your tip..." style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, boxSizing: 'border-box' }} />
      <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Why? (optional)" style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, resize: 'vertical', minHeight: 60, boxSizing: 'border-box', fontFamily: 'inherit' }} />
      <button onClick={submit} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', alignSelf: 'flex-start' }}>✨ Add Tip</button>
    </div>
  );
}

function AnnForm({ onAdd }) {
  const [text, setText] = useState('');
  const submit = () => { if (!text.trim()) return; onAdd(text); setText(''); };
  return <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}><input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Type announcement..." style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14 }} /><button onClick={submit} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid #e8e0f0', background: '#fff', color: '#666', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>Post</button></div>;
}

