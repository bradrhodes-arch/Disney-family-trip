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
  flights: {
    arrival: { airline: "Allegiant Airlines", flightNumber: "2967", departureAirport: "SBN", arrivalAirport: "MCO", departureTime: "9:39 AM", arrivalTime: "12:03 PM", terminal: "", gate: "", date: "2026-06-22" },
    departure: { airline: "Allegiant Airlines", flightNumber: "2967", departureAirport: "MCO", arrivalAirport: "SBN", departureTime: "6:15 AM", arrivalTime: "8:44 AM", terminal: "", gate: "", date: "2026-06-28" }
  },
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
  recommendations: [
    {
      id: 'ak-rope-drop-strategy',
      title: 'Animal Kingdom Rope Drop Strategy',
      description: `ARRIVAL TIMES:
• Disney Resort Guests: Arrive at bus stop 1 hour before Early Park Entry
• Off-Property Guests: Arrive at park 45 minutes before regular park open (or 15 min before Early Park Entry)

PARK ENTRY (1 Hour Before Open):
• Scan into park and head LEFT (Disney Resort Guests) or RIGHT (Non-Resort Guests)
• Resort guests can queue for attractions; Non-resort guests wait until park open

EARLY PARK ENTRY (30 min before regular open):
• Start with Flight of Passage, then Na'vi River Journey
• Breakfast option: Satu'li Canteen

REGULAR PARK OPENING:
• Non-resort guests: Start with Dinosaur, Expedition Everest, or Kilimanjaro Safari
• Breakfast options: Yak & Yeti Local Foods Cafe or Kusafiri Bakery

PRO TIP: Ride Flight of Passage right before park closes for shorter waits!`,
      category: 'Pro Tip',
      votes: 0,
      addedBy: 'System',
      voters: []
    }
  ],
  budgetTips: [
    { id: 1, text: "Buy multi-day tickets - the more days, the cheaper per day!", category: "🎟️ Tickets", addedBy: "System" },
    { id: 2, text: "Pack breakfast & snacks at the VRBO - saves $20+/person/day", category: "🍽️ Food & Dining", addedBy: "System" },
    { id: 3, text: "Bring refillable water bottles - free water at any quick service", category: "🍽️ Food & Dining", addedBy: "System" },
    { id: 4, text: "Mobile order food to skip lines and avoid impulse buys", category: "🍽️ Food & Dining", addedBy: "System" },
    { id: 5, text: "Memory Maker ($169) covers unlimited photos for the whole group", category: "📸 Photos & Souvenirs", addedBy: "System" },
    { id: 6, text: "Visit water parks on check-in day - it's FREE for resort guests in summer 2026!", category: "🏨 Lodging", addedBy: "System" },
    { id: 7, text: "Book dining reservations 60 days out - hard to get for groups of 15", category: "🍽️ Food & Dining", addedBy: "System" },
    { id: 8, text: "Use Disney gift cards bought at Target with RedCard for 5% off", category: "💡 General", addedBy: "System" },
    { id: 9, text: "Download My Disney Experience app and set up Genie+ strategies", category: "📱 Apps & Planning", addedBy: "System" },
    { id: 10, text: "Eat at quick service for lunch, table service for dinner only", category: "🍽️ Food & Dining", addedBy: "System" }
  ],
  polls: [],
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

// Editable Field Component
function EditableField({ label, value, type = 'text', placeholder, onSave, onDelete, showDelete = false, gridCols = 1, textarea = false, dateFormat = null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update editValue when value prop changes (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value || '');
    }
  }, [value, isEditing]);

  const handleEdit = () => {
    setEditValue(value || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      if (onDelete) onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const isEmpty = !value;
  const isUrl = type === 'url' && value && (value.startsWith('http://') || value.startsWith('https://'));
  const displayValue = isEmpty ? null : (type === 'date' && dateFormat ? dateFormat(value) : value);
  
  // Shorten URL for display
  const shortenUrl = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length > 0) {
        return `${urlObj.hostname}${pathParts[0] ? '/' + pathParts[0] : ''}`;
      }
      return urlObj.hostname;
    } catch {
      return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid #e8e0f0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  const fieldContainerStyle = gridCols > 1 ? { gridColumn: `span ${gridCols}` } : {};

  return (
    <div style={fieldContainerStyle}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6, textTransform: 'uppercase' }}>{label}</label>
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {textarea ? (
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder={placeholder}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
              autoFocus
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder={placeholder}
              style={inputStyle}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter' && !textarea) handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#667eea', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Save</button>
            <button onClick={handleCancel} style={{ flex: 1, padding: '8px 16px', borderRadius: 8, border: '1px solid #e8e0f0', background: '#fff', color: '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: isEmpty ? '#fafafa' : '#fff', border: isEmpty ? '1px dashed #e8e0f0' : '1px solid #f0f0f0', minHeight: textarea ? 80 : 'auto' }}>
            {isEmpty ? (
              <span style={{ color: '#ccc', fontStyle: 'italic' }}>{placeholder || 'Not set'}</span>
            ) : isUrl ? (
              <a href={value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#667eea', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                🔗 {shortenUrl(value)} →
              </a>
            ) : (
              <div style={{ fontSize: 14, color: '#4a4a6a', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {displayValue}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button onClick={handleEdit} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e8e0f0', background: '#fff', color: '#667eea', fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Edit</button>
            {showDelete && !isEmpty && (
              <>
                {showDeleteConfirm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px', borderRadius: 8, background: '#fff7e6', border: '1px solid #ffe58f', minWidth: 120 }}>
                    <div style={{ fontSize: 11, color: '#d48806', fontWeight: 600, marginBottom: 4 }}>Delete?</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => { if (onDelete) onDelete(); setShowDeleteConfirm(false); }} style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: 'none', background: '#f5576c', color: '#fff', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>Yes</button>
                      <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid #e8e0f0', background: '#fff', color: '#666', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>No</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleDelete} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #fff0f0', background: '#fff', color: '#f5576c', fontWeight: 600, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>Delete</button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate age based on trip dates
function calculateAgeAtTrip(birthdate, tripStartDate) {
  if (!birthdate || !tripStartDate) return null;
  try {
    const birth = new Date(birthdate);
    const tripStart = new Date(tripStartDate);
    let age = tripStart.getFullYear() - birth.getFullYear();
    const monthDiff = tripStart.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && tripStart.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  } catch {
    return null;
  }
}

// Helper function to get trip start date from data
function getTripStartDate(data) {
  if (!data) return '2026-06-22';
  
  try {
    // Try to get from flight arrival date first
    if (data?.flights?.arrival?.date) {
      return data.flights.arrival.date;
    }
    // Fallback to parsing from tripInfo.dates (June 22–28, 2026)
    if (data?.tripInfo?.dates) {
      const match = data.tripInfo.dates.match(/(\w+)\s+(\d+)/);
      if (match) {
        const monthMap = { 'June': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12', 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05' };
        const month = monthMap[match[1]] || '06';
        const day = match[2].padStart(2, '0');
        const year = data.tripInfo.dates.match(/202\d/)?.[0] || '2026';
        return `${year}-${month}-${day}`;
      }
    }
  } catch (e) {
    console.error('Error parsing trip start date:', e);
  }
  
  // Default to June 22, 2026
  return '2026-06-22';
}

// Family Member Accordion (simplified)
function FamilyMemberAccordion({ member, index, familyId, isOpen, onToggle, onUpdateMember, onRemoveMember, currentUser, onConfirmDelete, deletingMemberId, setData, tripData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: member.firstName || '',
    lastName: member.lastName || '',
    birthdate: member.birthdate || '',
    phone: member.phone || '',
    emergencyContactName: member.emergencyContactName || '',
    emergencyContactPhone: member.emergencyContactPhone || '',
    otherInfo: member.otherInfo || ''
  });

  // Only sync editData when member changes AND we're not currently editing
  // This prevents overwriting user input while they're typing
  // Also check if the data actually changed to prevent unnecessary resets
  const prevMemberRef = useRef(null);
  useEffect(() => {
    if (!isEditing) {
      const memberStr = JSON.stringify(member);
      const prevMemberStr = prevMemberRef.current ? JSON.stringify(prevMemberRef.current) : null;
      
      // Only update if member actually changed
      if (memberStr !== prevMemberStr) {
        setEditData({
          firstName: member.firstName || '',
          lastName: member.lastName || '',
          birthdate: member.birthdate || '',
          phone: member.phone || '',
          emergencyContactName: member.emergencyContactName || '',
          emergencyContactPhone: member.emergencyContactPhone || '',
          otherInfo: member.otherInfo || ''
        });
        prevMemberRef.current = member;
      }
    }
  }, [member, isEditing]);

  const displayName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unnamed Member';
  const displayPhone = member.phone || '';
  const isComplete = member.firstName && member.lastName && member.phone;
  
  // Calculate age at trip time - safely handle missing tripData
  let ageAtTrip = null;
  let isChild = false;
  let isUnder3 = false;
  let memberType = 'Adult';
  
  try {
    let tripStartDate = '2026-06-22';
    if (tripData && typeof tripData === 'object') {
      tripStartDate = getTripStartDate(tripData);
    }
    
    if (member && member.birthdate) {
      ageAtTrip = calculateAgeAtTrip(member.birthdate, tripStartDate);
      if (ageAtTrip !== null && typeof ageAtTrip === 'number') {
        isChild = ageAtTrip < 21;
        isUnder3 = ageAtTrip < 3;
        memberType = isChild ? 'Child' : 'Adult';
      }
    }
  } catch (e) {
    console.error('Error calculating age:', e);
    // Keep default values (all false/null)
    ageAtTrip = null;
    isChild = false;
    isUnder3 = false;
    memberType = 'Adult';
  }

  const handleSave = (e) => {
    e?.stopPropagation();
    // Always use setData if available - it's more reliable
    if (setData) {
      setData(p => {
        if (!p || !p.families) {
          console.error('Invalid data structure:', p);
          return p;
        }
        const updated = JSON.parse(JSON.stringify(p));
        const family = updated.families.find(f => f.id === familyId);
        if (!family) {
          console.error('Family not found:', familyId);
          return updated;
        }
        const memberIndex = family.members.findIndex(m => m.id === member.id);
        if (memberIndex === -1) {
          console.error('Member not found:', member.id);
          return updated;
        }
        // Update the member with all fields
        family.members[memberIndex] = {
          ...family.members[memberIndex],
          firstName: editData.firstName || '',
          lastName: editData.lastName || '',
          birthdate: editData.birthdate || '',
          phone: editData.phone || '',
          emergencyContactName: editData.emergencyContactName || '',
          emergencyContactPhone: editData.emergencyContactPhone || '',
          otherInfo: editData.otherInfo || '',
          lastEditedBy: currentUser?.name
        };
        return updated;
      });
    } else {
      // Fallback to individual updates if setData not available
      console.warn('setData not available, using individual updates');
      onUpdateMember(familyId, member.id, 'firstName', editData.firstName);
      onUpdateMember(familyId, member.id, 'lastName', editData.lastName);
      onUpdateMember(familyId, member.id, 'birthdate', editData.birthdate);
      onUpdateMember(familyId, member.id, 'phone', editData.phone);
      onUpdateMember(familyId, member.id, 'emergencyContactName', editData.emergencyContactName);
      onUpdateMember(familyId, member.id, 'emergencyContactPhone', editData.emergencyContactPhone);
      onUpdateMember(familyId, member.id, 'otherInfo', editData.otherInfo);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      birthdate: member.birthdate || '',
      phone: member.phone || '',
      emergencyContactName: member.emergencyContactName || '',
      emergencyContactPhone: member.emergencyContactPhone || '',
      otherInfo: member.otherInfo || ''
    });
    setIsEditing(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1px solid #e8e0f0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  };

  return (
    <div style={{ background: '#fafafa', borderRadius: 8, marginBottom: 8, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#4a4a6a' }}>{displayName}</div>
            {ageAtTrip !== null && (isUnder3 || isChild) && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: isUnder3 ? '#fff7e6' : '#f0e6ff', color: isUnder3 ? '#d48806' : '#764ba2' }}>
                {isUnder3 ? `Under 3 (Age ${ageAtTrip})` : `Under 21 (Age ${ageAtTrip})`}
              </span>
            )}
            {ageAtTrip !== null && !isChild && (
              <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: '#f0f0f0', color: '#666' }}>
                Adult
              </span>
            )}
          </div>
          {displayPhone ? (
            <div style={{ fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Phone:</span>
              <a href={`tel:${displayPhone.replace(/\D/g, '')}`} onClick={(e) => e.stopPropagation()} style={{ color: '#667eea', textDecoration: 'none', fontWeight: 500 }}>{displayPhone}</a>
              <span style={{ color: '#ccc', margin: '0 2px' }}>•</span>
              <a href={`sms:${displayPhone.replace(/\D/g, '')}`} onClick={(e) => e.stopPropagation()} style={{ color: '#667eea', textDecoration: 'none', fontSize: 11 }}>Text</a>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#ccc' }}>No phone</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#888', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 10 }}>▼</span>
        </div>
      </div>
      {isOpen && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid #f0f0f0', background: '#fff' }}>
          {!isEditing ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #e8e0f0', background: '#fff', color: '#667eea', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Edit</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>First Name</label>
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 13, color: '#4a4a6a' }}>
                    {member.firstName || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Not set</span>}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Last Name</label>
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 13, color: '#4a4a6a' }}>
                    {member.lastName || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Not set</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Birthdate</label>
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 13, color: '#4a4a6a' }}>
                    {member.birthdate ? (
                      <div>
                        <div>{new Date(member.birthdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        {ageAtTrip !== null && (isUnder3 || isChild) && (
                          <div style={{ fontSize: 11, color: isUnder3 ? '#d48806' : '#764ba2', fontWeight: 600, marginTop: 4 }}>
                            {isUnder3 ? `⚠️ Under 3 years old (Age ${ageAtTrip} at trip)` : `⚠️ Under 21 years old (Age ${ageAtTrip} at trip)`}
                          </div>
                        )}
                        {ageAtTrip !== null && !isChild && (
                          <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                            Age {ageAtTrip} at trip • {memberType}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#ccc', fontStyle: 'italic' }}>Not set</span>
                    )}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Phone Number</label>
                  <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 13, color: '#4a4a6a' }}>
                    {member.phone ? (
                      <a href={`tel:${member.phone.replace(/\D/g, '')}`} style={{ color: '#667eea', textDecoration: 'none', fontWeight: 500 }}>{member.phone}</a>
                    ) : (
                      <span style={{ color: '#ccc', fontStyle: 'italic' }}>Not set</span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Emergency Contact (Not on trip)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 500, color: '#aaa', marginBottom: 3 }}>Name</label>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 13, color: '#4a4a6a' }}>
                      {member.emergencyContactName || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Not set</span>}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 500, color: '#aaa', marginBottom: 3 }}>Phone</label>
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 13, color: '#4a4a6a' }}>
                      {member.emergencyContactPhone ? (
                        <a href={`tel:${member.emergencyContactPhone.replace(/\D/g, '')}`} style={{ color: '#667eea', textDecoration: 'none' }}>{member.emergencyContactPhone}</a>
                      ) : (
                        <span style={{ color: '#ccc', fontStyle: 'italic' }}>Not set</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Other Important Info</label>
                <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fafafa', border: '1px solid #f0f0f0', fontSize: 13, color: '#4a4a6a', minHeight: 60, whiteSpace: 'pre-wrap' }}>
                  {member.otherInfo || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Not set</span>}
                </div>
              </div>
              {isComplete && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                  {deletingMemberId === member.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 13, color: '#f5576c', fontWeight: 600, marginBottom: 6 }}>Are you sure you want to delete {displayName}?</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => onConfirmDelete(familyId, member.id, true)} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', background: '#f5576c', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Yes, Delete</button>
                        <button onClick={() => onConfirmDelete(familyId, member.id, false)} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e8e0f0', background: '#fff', color: '#666', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => onConfirmDelete(familyId, member.id, null)} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #fff0f0', background: '#fff', color: '#f5576c', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Delete Member</button>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }} onClick={(e) => e.stopPropagation()}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>First Name</label>
                  <input type="text" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} onClick={(e) => e.stopPropagation()} placeholder="First name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Last Name</label>
                  <input type="text" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} onClick={(e) => e.stopPropagation()} placeholder="Last name" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }} onClick={(e) => e.stopPropagation()}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Birthdate</label>
                  <input type="date" value={editData.birthdate} onChange={e => setEditData({...editData, birthdate: e.target.value})} onClick={(e) => e.stopPropagation()} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Phone Number</label>
                  <input type="tel" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} onClick={(e) => e.stopPropagation()} placeholder="(555) 123-4567" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }} onClick={(e) => e.stopPropagation()}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Emergency Contact (Not on trip)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input type="text" value={editData.emergencyContactName} onChange={e => setEditData({...editData, emergencyContactName: e.target.value})} onClick={(e) => e.stopPropagation()} placeholder="Name" style={inputStyle} />
                  <input type="tel" value={editData.emergencyContactPhone} onChange={e => setEditData({...editData, emergencyContactPhone: e.target.value})} onClick={(e) => e.stopPropagation()} placeholder="Phone number" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 10 }} onClick={(e) => e.stopPropagation()}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 4, textTransform: 'uppercase' }}>Other Important Info</label>
                <textarea value={editData.otherInfo} onChange={e => setEditData({...editData, otherInfo: e.target.value})} onClick={(e) => e.stopPropagation()} placeholder="Dietary restrictions, medical info, allergies, special needs..." style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                <button onClick={handleSave} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: 'none', background: '#667eea', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Save</button>
                <button onClick={(e) => { e.stopPropagation(); handleCancel(); }} style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e8e0f0', background: '#fff', color: '#666', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Family Accordion
function FamilyAccordion({ family, isOpen, onToggle, onUpdateMember, onAddMember, onRemoveMember, onRemoveFamily, currentUser, onConfirmDeleteMember, deletingMemberId, setData, tripData }) {
  const [openMembers, setOpenMembers] = useState([]);
  const [deletingFamily, setDeletingFamily] = useState(false);
  
  return (
    <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderLeft: '3px solid #667eea', cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#4a4a6a' }}>{family.lastName} Family</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}>{family.members.length} {family.members.length === 1 ? 'member' : 'members'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {family.members.length > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setDeletingFamily(true); }} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fff0f0', background: '#fff', color: '#f5576c', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
          )}
          <span style={{ color: '#888', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 10 }}>▼</span>
        </div>
      </div>
      {deletingFamily && (
        <div style={{ padding: '12px 16px', background: '#fff7e6', borderTop: '1px solid #ffe58f' }}>
          <div style={{ fontSize: 13, color: '#d48806', fontWeight: 600, marginBottom: 8 }}>Are you sure you want to delete the {family.lastName} family?</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => { onRemoveFamily(family.id); setDeletingFamily(false); }} style={{ flex: 1, padding: '6px 12px', borderRadius: 6, border: 'none', background: '#f5576c', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Yes, Delete</button>
            <button onClick={() => setDeletingFamily(false)} style={{ flex: 1, padding: '6px 12px', borderRadius: 6, border: '1px solid #e8e0f0', background: '#fff', color: '#666', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      {isOpen && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
          {family.members.map((member, idx) => (
            <FamilyMemberAccordion
              key={member.id}
              member={member}
              index={idx}
              familyId={family.id}
              isOpen={openMembers.includes(member.id)}
              onToggle={() => setOpenMembers(p => p.includes(member.id) ? p.filter(id => id !== member.id) : [...p, member.id])}
              onUpdateMember={onUpdateMember}
              onRemoveMember={onRemoveMember}
              currentUser={currentUser}
              onConfirmDelete={onConfirmDeleteMember}
              deletingMemberId={deletingMemberId}
              setData={setData}
              tripData={data}
            />
          ))}
          <button onClick={() => onAddMember(family.id)} style={{ width: '100%', padding: '10px', borderRadius: 8, border: '2px dashed #e8e0f0', background: '#fafafa', color: '#888', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>+ Add Family Member</button>
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
  const [passwordInput, setPasswordInput] = useState(() => {
    // Load saved password from localStorage
    try {
      return localStorage.getItem('disney-trip-saved-password') || '';
    } catch {
      return '';
    }
  });
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
  const [trackingFlights, setTrackingFlights] = useState({ arrival: false, departure: false });
  const [deletingMember, setDeletingMember] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', or null
  const btnRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const r = await storage.get(STORAGE_KEY);
        if (r?.value) {
          const p = JSON.parse(r.value);
          p.days = p.days.map(d => ({ ...d, activities: d.activities.map(a => typeof a === 'string' ? { text: a, editedBy: null } : a) }));
          
          // Ensure default recommendations are included
          if (!p.recommendations || p.recommendations.length === 0) {
            p.recommendations = defaultData.recommendations;
          } else {
            // Add default recommendations if they don't exist
            const defaultRecIds = defaultData.recommendations.map(r => r.id);
            const existingRecIds = p.recommendations.map(r => r.id);
            const missingRecs = defaultData.recommendations.filter(r => !existingRecIds.includes(r.id));
            if (missingRecs.length > 0) {
              p.recommendations = [...p.recommendations, ...missingRecs];
            }
          }
          
          // Ensure default budget tips are included
          if (!p.budgetTips || p.budgetTips.length === 0) {
            p.budgetTips = defaultData.budgetTips;
          } else {
            // Add default budget tips if they don't exist
            const defaultTipIds = defaultData.budgetTips.map(t => t.id);
            const existingTipIds = p.budgetTips.map(t => t.id);
            const missingTips = defaultData.budgetTips.filter(t => !existingTipIds.includes(t.id));
            if (missingTips.length > 0) {
              p.budgetTips = [...p.budgetTips, ...missingTips];
            }
          }
          
          // Ensure flights structure exists
          if (!p.flights) {
            p.flights = defaultData.flights;
          }
          
          // Ensure polls array exists
          if (!p.polls) {
            p.polls = [];
          }
          
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
    // Only update if the data is actually different to prevent overwriting local changes
    let lastUpdateTime = Date.now();
    const channel = supabase
      .channel('trip-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'trip_data' },
        (payload) => {
          if (payload.new.id === STORAGE_KEY) {
            const now = Date.now();
            // Debounce: ignore updates that happen within 500ms (likely from our own save)
            if (now - lastUpdateTime < 500) {
              return;
            }
            lastUpdateTime = now;
            
            const updatedData = payload.new.data;
            updatedData.days = updatedData.days.map(d => ({ 
              ...d, 
              activities: d.activities.map(a => typeof a === 'string' ? { text: a, editedBy: null } : a) 
            }));
            
            // Only update if data is actually different (prevent unnecessary re-renders)
            setData(currentData => {
              const currentStr = JSON.stringify(currentData);
              const newStr = JSON.stringify(updatedData);
              if (currentStr !== newStr) {
                return updatedData;
              }
              return currentData;
            });
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

  const save = useCallback(async (d, showStatus = false) => {
    if (showStatus) {
      setSaveStatus('saving');
    }
    try { 
      await storage.set(STORAGE_KEY, JSON.stringify(d)); 
      if (showStatus) {
        setSaveStatus('saved');
        // Clear saved status after 2 seconds
        setTimeout(() => setSaveStatus(null), 2000);
      }
    } catch {
      if (showStatus) {
        setSaveStatus(null);
      }
    }
  }, []);

  // Debounced auto-save - only save when data actually changes, not on every render
  // This auto-save runs silently (no status indicator) to prevent flashing
  const saveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  const isSavingRef = useRef(false);
  
  useEffect(() => {
    if (data && !loading && currentUser && !isSavingRef.current) {
      // Only auto-save if data actually changed (compare stringified versions)
      const dataStr = JSON.stringify(data);
      if (dataStr !== lastSavedDataRef.current) {
        // Clear any existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        // Set new timeout - don't show saving status for auto-saves
        saveTimeoutRef.current = setTimeout(async () => {
          isSavingRef.current = true;
          await save(data, false); // false = don't show status
          lastSavedDataRef.current = dataStr;
          // Wait a bit before allowing next save to prevent race conditions
          setTimeout(() => {
            isSavingRef.current = false;
          }, 1000);
        }, 1500);
        return () => {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
        };
      }
    }
  }, [data, loading, save, currentUser]);

  const addHistory = (action) => {
    if (!currentUser) return;
    setData(p => ({ ...p, editHistory: [{ user: currentUser.name, action, time: new Date().toISOString() }, ...(p.editHistory || []).slice(0, 49)] }));
  };

  const handlePassword = () => {
    if (passwordInput === 'Disney2026' || passwordInput === data?.tripInfo?.password) {
      setPasswordError(false);
      // Save password to localStorage
      try {
        localStorage.setItem('disney-trip-saved-password', passwordInput);
      } catch (e) {
        console.error('Failed to save password:', e);
      }
      setStep('name');
    } else {
      setPasswordError(true);
    }
  };

  const handleName = () => {
    if (!nameInput.trim()) return;
    if (btnRef.current) { const r = btnRef.current.getBoundingClientRect(); setWandPosition({ x: r.left + r.width / 2, y: r.top }); }
    setCurrentUser({ name: nameInput.trim() });
    setShowWand(true);
    setTimeout(() => setShowGlitter(true), 200);
  };

  const handleGlitterDone = () => { setUnlockComplete(true); setTimeout(() => setIsUnlocked(true), 400); };
  const logout = () => {
    setCurrentUser(null);
    setIsUnlocked(false);
    setStep('password');
    // Keep password saved, just clear name
    setNameInput('');
    setUnlockComplete(false);
  };

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
          emergencyContactName: '',
          emergencyContactPhone: '',
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
          ? { ...f, members: [...f.members, { id: Date.now(), firstName: '', lastName: f.lastName, phone: '', birthdate: '', emergencyContactName: '', emergencyContactPhone: '', otherInfo: '', addedBy: currentUser?.name }] }
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

  const confirmDeleteMember = (familyId, memberId, confirm) => {
    if (confirm === null) {
      // Show confirmation
      setDeletingMember(memberId);
    } else if (confirm === true) {
      // Actually delete
      removeFamilyMember(familyId, memberId);
      setDeletingMember(null);
    } else {
      // Cancel
      setDeletingMember(null);
    }
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
  const addPoll = (poll) => { setData(p => ({ ...p, polls: [...p.polls, { id: Date.now(), question: poll.question, options: poll.options.map(opt => ({ text: opt, votes: 0, voters: [] })), addedBy: currentUser?.name, createdAt: new Date().toISOString() }] })); addHistory(`created poll: ${poll.question}`); };
  const votePoll = (pollId, optionIndex) => { setData(p => ({ ...p, polls: p.polls.map(poll => poll.id === pollId ? { ...poll, options: poll.options.map((opt, idx) => idx === optionIndex && !opt.voters.includes(currentUser?.name) ? { ...opt, votes: opt.votes + 1, voters: [...opt.voters, currentUser?.name] } : opt) } : poll) })); };
  const removePoll = (pollId) => { setData(p => ({ ...p, polls: p.polls.filter(poll => poll.id !== pollId) })); addHistory('removed poll'); };
  const addBudgetTip = (tip) => { setData(p => ({ ...p, budgetTips: [...(p.budgetTips || []), { id: Date.now(), text: tip.text, category: tip.category, addedBy: currentUser?.name }] })); addHistory('added budget tip'); };
  const removeBudgetTip = (tipId) => { setData(p => ({ ...p, budgetTips: (p.budgetTips || []).filter(tip => tip.id !== tipId) })); addHistory('removed budget tip'); };
  const updateField = (path, val, desc) => { 
    setData(p => { 
      const d = JSON.parse(JSON.stringify(p)); 
      const k = path.split('.'); 
      let c = d; 
      for (let i = 0; i < k.length - 1; i++) c = c[k[i]]; 
      c[k[k.length - 1]] = val; 
      return d; 
    }); 
    if (desc) addHistory(desc);
    // Auto-save will handle saving silently - no status flashing
  };


  const trackFlight = async (flightType) => {
    const flight = data.flights[flightType];
    if (!flight || !flight.flightNumber || !flight.airline) return;
    
    setTrackingFlights(prev => ({ ...prev, [flightType]: true }));
    
    try {
      // Get airline IATA code
      const airlineCode = flight.airline.includes('Allegiant') ? 'G4' : 
                         flight.airline.includes('Delta') ? 'DL' :
                         flight.airline.includes('Southwest') ? 'WN' :
                         flight.airline.includes('American') ? 'AA' :
                         flight.airline.includes('United') ? 'UA' : '';
      
      const flightCode = airlineCode ? `${airlineCode}${flight.flightNumber}` : flight.flightNumber;
      const trackingUrl = `https://www.flightaware.com/live/flight/${flightCode}`;
      
      // Update flight with tracking URL and status
      // Note: For real-time status, you'd need a flight API key
      // This provides the tracking link and updates timestamp
      const flightStatus = {
        status: 'Tracked',
        trackingUrl: trackingUrl,
        lastUpdated: new Date().toISOString()
      };
      
      setData(p => {
        const d = JSON.parse(JSON.stringify(p));
        d.flights[flightType] = {
          ...d.flights[flightType],
          ...flightStatus
        };
        return d;
      });
      
      addHistory(`tracked ${flightType} flight ${flight.flightNumber}`);
    } catch (error) {
      console.error('Flight tracking error:', error);
    } finally {
      setTrackingFlights(prev => ({ ...prev, [flightType]: false }));
    }
  };
  
  // Auto-update flight tracking every 5 minutes for flights today or tomorrow
  useEffect(() => {
    if (!data || !data.flights || !currentUser) return;
    
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    const intervals = [];
    
    Object.keys(data.flights).forEach(flightType => {
      const flight = data.flights[flightType];
      if (flight && flight.date && (flight.date === today || flight.date === tomorrow) && flight.flightNumber && flight.airline) {
        // Initial track on mount
        trackFlight(flightType);
        
        // Then auto-update every 5 minutes
        const checkInterval = setInterval(() => {
          trackFlight(flightType);
        }, 300000); // Check every 5 minutes
        
        intervals.push(checkInterval);
      }
    });
    
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [data?.flights?.arrival?.date, data?.flights?.departure?.date, currentUser]);

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
          <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePassword()} placeholder="Family password..." style={{ width: '100%', padding: '16px 20px', borderRadius: 12, border: '2px solid #e8e0f0', fontSize: 16, textAlign: 'center', marginBottom: 12, boxSizing: 'border-box' }} autoComplete="current-password" />
          {passwordInput && <p style={{ fontSize: 12, color: '#888', marginTop: -8, marginBottom: 8 }}>Password saved - you won't need to enter it again!</p>}
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

  const tabs = [{ id: 'itinerary', label: 'Itinerary', icon: '' }, { id: 'contacts', label: 'Family', icon: '' }, { id: 'flights', label: 'Flights', icon: '' }, { id: 'lodging', label: 'Lodging', icon: '' }, { id: 'tips', label: 'Planning', icon: '' }, { id: 'polls', label: 'Polls', icon: '' }, { id: 'emergency', label: 'Emergency', icon: '' }, { id: 'history', label: 'Activity', icon: '' }];
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
          {saveStatus === 'saving' && <span style={{ padding: '6px 12px', borderRadius: 20, background: '#fff7e6', color: '#d48806', fontSize: 13 }}>Saving...</span>}
          {saveStatus === 'saved' && <span style={{ padding: '6px 12px', borderRadius: 20, background: '#f6ffed', color: '#52c41a', fontSize: 13 }}>Saved</span>}
          <UserBadge user={currentUser} onLogout={logout} />
        </div>
      </header>

      {data.announcements.length > 0 && <div style={{ background: 'linear-gradient(90deg, #fff7e6, #fffbe6)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #ffe58f', position: 'relative', zIndex: 10 }}><span style={{ flex: 1, color: '#d48806' }}>{data.announcements[0].text}</span><span style={{ color: '#888', fontSize: 13 }}>— {data.announcements[0].author}</span></div>}

      <nav style={{ display: 'flex', gap: 8, padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0e6ff', overflowX: 'auto', position: 'relative', zIndex: 10, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: '#ccc #f0f0f0' }}>
        {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '1px solid #e8e0f0', background: activeTab === t.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#fff', color: activeTab === t.id ? '#fff' : '#666', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: activeTab === t.id ? 600 : 400, minWidth: 'fit-content', flexShrink: 0 }}><span>{t.label}</span></button>)}
        <style>{`
          nav::-webkit-scrollbar {
            height: 6px;
          }
          nav::-webkit-scrollbar-track {
            background: #f0f0f0;
            border-radius: 3px;
          }
          nav::-webkit-scrollbar-thumb {
            background: #999;
            border-radius: 3px;
          }
          nav::-webkit-scrollbar-thumb:hover {
            background: #666;
          }
          @media (max-width: 768px) {
            nav {
              padding-left: 16px;
              padding-right: 16px;
            }
            nav button {
              padding: 10px 16px;
              font-size: 13px;
            }
          }
        `}</style>
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
                onConfirmDeleteMember={confirmDeleteMember}
                deletingMemberId={deletingMember}
                setData={setData}
                tripData={data}
              />
            ))}
            {(!data.families || data.families.length === 0) && !showAddFamilyForm && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888', background: '#fff', borderRadius: 16 }}>
                <p>No families yet. Click "Add Family" to get started!</p>
              </div>
            )}
          </div>
        </div>}

        {activeTab === 'flights' && <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Flight Information</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Arrival and departure flight details</p>
          
          <div style={{ background: '#fff7e6', borderRadius: 12, padding: 16, marginBottom: 24, border: '1px solid #ffe58f' }}>
            <p style={{ margin: 0, fontSize: 14, color: '#d48806', lineHeight: 1.5 }}>
              Flight information will be updated when closer to departure date. Gate and terminal details will appear automatically as they become available.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Arrival Flight Accordion */}
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '20px 24px', 
                  borderLeft: '4px solid #667eea', 
                  cursor: 'pointer' 
                }} 
                onClick={() => setOpenDays(p => p.includes('arrival-flight') ? p.filter(x => x !== 'arrival-flight') : [...p, 'arrival-flight'])}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#4a4a6a', marginBottom: 4 }}>Arrival to Orlando</div>
                  <div style={{ fontSize: 13, color: '#888' }}>
                    {data.flights?.arrival?.airline || 'Airline'} {data.flights?.arrival?.flightNumber || 'Flight'} • {data.flights?.arrival?.departureAirport || 'SBN'} → {data.flights?.arrival?.arrivalAirport || 'MCO'}
                    {data.flights?.arrival?.date && ` • ${new Date(data.flights.arrival.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    {data.flights?.arrival?.departureTime && ` • ${data.flights.arrival.departureTime}`}
                  </div>
                  {data.flights?.arrival?.status && (
                    <div style={{ fontSize: 12, color: '#764ba2', marginTop: 4 }}>
                      Status: {data.flights.arrival.status}
                      {data.flights.arrival.trackingUrl && (
                        <a href={data.flights.arrival.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: '#667eea', textDecoration: 'none' }}>Track →</a>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); trackFlight('arrival'); }} 
                    disabled={trackingFlights.arrival}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      border: 'none', 
                      background: trackingFlights.arrival ? '#f0f0f0' : 'linear-gradient(135deg, #667eea, #764ba2)', 
                      color: trackingFlights.arrival ? '#999' : '#fff', 
                      fontWeight: 600, 
                      fontSize: 12, 
                      cursor: trackingFlights.arrival ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    {trackingFlights.arrival ? 'Tracking...' : 'Track'}
                  </button>
                  <span style={{ color: '#888', transition: 'transform 0.2s', transform: openDays.includes('arrival-flight') ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 12 }}>▼</span>
                </div>
              </div>
              {openDays.includes('arrival-flight') && (
                <div style={{ padding: '24px', borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <EditableField
                      label="Airline"
                      value={data.flights?.arrival?.airline}
                      placeholder="Allegiant Airlines"
                      onSave={(val) => updateField('flights.arrival.airline', val)}
                    />
                    <EditableField
                      label="Flight Number"
                      value={data.flights?.arrival?.flightNumber}
                      placeholder="2967"
                      onSave={(val) => updateField('flights.arrival.flightNumber', val)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <EditableField
                      label="From"
                      value={data.flights?.arrival?.departureAirport}
                      placeholder="SBN"
                      onSave={(val) => updateField('flights.arrival.departureAirport', val)}
                    />
                    <EditableField
                      label="To"
                      value={data.flights?.arrival?.arrivalAirport}
                      placeholder="MCO"
                      onSave={(val) => updateField('flights.arrival.arrivalAirport', val)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <EditableField
                      label="Date"
                      value={data.flights?.arrival?.date}
                      type="date"
                      dateFormat={(val) => val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      onSave={(val) => updateField('flights.arrival.date', val)}
                    />
                    <EditableField
                      label="Departure Time"
                      value={data.flights?.arrival?.departureTime}
                      placeholder="9:39 AM"
                      onSave={(val) => updateField('flights.arrival.departureTime', val)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <EditableField
                      label="Arrival Time"
                      value={data.flights?.arrival?.arrivalTime}
                      placeholder="12:03 PM"
                      onSave={(val) => updateField('flights.arrival.arrivalTime', val)}
                    />
                    <EditableField
                      label="Gate / Terminal"
                      value={data.flights?.arrival?.gate ? `${data.flights.arrival.gate}${data.flights.arrival.terminal ? ` / ${data.flights.arrival.terminal}` : ''}` : ''}
                      placeholder="Will update automatically"
                      onSave={(val) => {
                        const parts = val.split(' / ');
                        updateField('flights.arrival.gate', parts[0] || '');
                        if (parts[1]) updateField('flights.arrival.terminal', parts[1]);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Departure Flight Accordion */}
            <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '20px 24px', 
                  borderLeft: '4px solid #f5576c', 
                  cursor: 'pointer' 
                }} 
                onClick={() => setOpenDays(p => p.includes('departure-flight') ? p.filter(x => x !== 'departure-flight') : [...p, 'departure-flight'])}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#4a4a6a', marginBottom: 4 }}>Departure from Orlando</div>
                  <div style={{ fontSize: 13, color: '#888' }}>
                    {data.flights?.departure?.airline || 'Airline'} {data.flights?.departure?.flightNumber || 'Flight'} • {data.flights?.departure?.departureAirport || 'MCO'} → {data.flights?.departure?.arrivalAirport || 'SBN'}
                    {data.flights?.departure?.date && ` • ${new Date(data.flights.departure.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    {data.flights?.departure?.departureTime && ` • ${data.flights.departure.departureTime}`}
                  </div>
                  {data.flights?.departure?.status && (
                    <div style={{ fontSize: 12, color: '#764ba2', marginTop: 4 }}>
                      Status: {data.flights.departure.status}
                      {data.flights.departure.trackingUrl && (
                        <a href={data.flights.departure.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8, color: '#667eea', textDecoration: 'none' }}>Track →</a>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); trackFlight('departure'); }} 
                    disabled={trackingFlights.departure}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 8, 
                      border: 'none', 
                      background: trackingFlights.departure ? '#f0f0f0' : 'linear-gradient(135deg, #667eea, #764ba2)', 
                      color: trackingFlights.departure ? '#999' : '#fff', 
                      fontWeight: 600, 
                      fontSize: 12, 
                      cursor: trackingFlights.departure ? 'not-allowed' : 'pointer' 
                    }}
                  >
                    {trackingFlights.departure ? 'Tracking...' : 'Track'}
                  </button>
                  <span style={{ color: '#888', transition: 'transform 0.2s', transform: openDays.includes('departure-flight') ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 12 }}>▼</span>
                </div>
              </div>
              {openDays.includes('departure-flight') && (
                <div style={{ padding: '24px', borderTop: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <EditableField
                      label="Airline"
                      value={data.flights?.departure?.airline}
                      placeholder="Allegiant Airlines"
                      onSave={(val) => updateField('flights.departure.airline', val)}
                    />
                    <EditableField
                      label="Flight Number"
                      value={data.flights?.departure?.flightNumber}
                      placeholder="2967"
                      onSave={(val) => updateField('flights.departure.flightNumber', val)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <EditableField
                      label="From"
                      value={data.flights?.departure?.departureAirport}
                      placeholder="MCO"
                      onSave={(val) => updateField('flights.departure.departureAirport', val)}
                    />
                    <EditableField
                      label="To"
                      value={data.flights?.departure?.arrivalAirport}
                      placeholder="SBN"
                      onSave={(val) => updateField('flights.departure.arrivalAirport', val)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <EditableField
                      label="Date"
                      value={data.flights?.departure?.date}
                      type="date"
                      dateFormat={(val) => val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      onSave={(val) => updateField('flights.departure.date', val)}
                    />
                    <EditableField
                      label="Departure Time"
                      value={data.flights?.departure?.departureTime}
                      placeholder="6:15 AM"
                      onSave={(val) => updateField('flights.departure.departureTime', val)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <EditableField
                      label="Arrival Time"
                      value={data.flights?.departure?.arrivalTime}
                      placeholder="8:44 AM"
                      onSave={(val) => updateField('flights.departure.arrivalTime', val)}
                    />
                    <EditableField
                      label="Gate / Terminal"
                      value={data.flights?.departure?.gate ? `${data.flights.departure.gate}${data.flights.departure.terminal ? ` / ${data.flights.departure.terminal}` : ''}` : ''}
                      placeholder="Will update automatically"
                      onSave={(val) => {
                        const parts = val.split(' / ');
                        updateField('flights.departure.gate', parts[0] || '');
                        if (parts[1]) updateField('flights.departure.terminal', parts[1]);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>}

        {activeTab === 'lodging' && <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Our Home Base</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Where we're staying!</p>
          
          <div style={cardStyle}>
            {/* Check-in and Check-out at the top */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: '2px solid #f0e6ff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #52c41a, #73d13d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🔑</div>
                <div style={{ flex: 1 }}>
                  <EditableField
                    label="Check-in"
                    value={data.lodging.checkIn}
                    placeholder="4:00 PM"
                    onSave={(val) => updateField('lodging.checkIn', val)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #f5576c, #ff7875)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🚪</div>
                <div style={{ flex: 1 }}>
                  <EditableField
                    label="Check-out"
                    value={data.lodging.checkOut}
                    placeholder="10:00 AM"
                    onSave={(val) => updateField('lodging.checkOut', val)}
                  />
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div style={{ marginBottom: 20 }}>
              <EditableField
                label="Property Name"
                value={data.lodging.name}
                placeholder="e.g., Magical Villa"
                onSave={(val) => updateField('lodging.name', val)}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <EditableField
                label="Address"
                value={data.lodging.address}
                placeholder="123 Magic Way, Kissimmee, FL"
                onSave={(val) => updateField('lodging.address', val)}
              />
              {data.lodging.address && (
                <div style={{ marginTop: 8 }}>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.lodging.address)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnSecondary, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '8px 16px' }}>📍 Open Maps</a>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <EditableField
                label="VRBO Link"
                value={data.lodging.vrboLink}
                type="url"
                placeholder="https://www.vrbo.com/..."
                onSave={(val) => updateField('lodging.vrboLink', val)}
              />
            </div>

            {/* Notes - Always editable */}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0e6ff' }}>
              <EditableField
                label="Important Information"
                value={data.lodging.notes}
                placeholder="Gate code, wifi password, parking instructions, pool rules..."
                textarea={true}
                onSave={(val) => updateField('lodging.notes', val)}
              />
            </div>
          </div>
        </div>}

        {activeTab === 'tips' && <PlanningTab 
          data={data}
          currentUser={currentUser}
          addRec={addRec}
          voteRec={voteRec}
          addBudgetTip={addBudgetTip}
          removeBudgetTip={removeBudgetTip}
          addAnn={addAnn}
          cardStyle={cardStyle}
        />}

        {activeTab === 'polls' && <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Polls</h2>
          <p style={{ color: '#888', marginBottom: 24 }}>Create polls to get group input on decisions!</p>
          <PollForm onAdd={addPoll} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(data.polls || []).map(poll => (
              <div key={poll.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#4a4a6a' }}>{poll.question}</div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>Created by {poll.addedBy}</div>
                  </div>
                  <button onClick={() => removePoll(poll.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fff0f0', color: '#f5576c', fontSize: 16, cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {poll.options.map((option, idx) => {
                    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    const hasVoted = option.voters.includes(currentUser?.name);
                    return (
                      <div key={idx} style={{ position: 'relative' }}>
                        <button
                          onClick={() => !hasVoted && votePoll(poll.id, idx)}
                          disabled={hasVoted}
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: 10,
                            border: hasVoted ? '2px solid #667eea' : '1px solid #e8e0f0',
                            background: hasVoted ? '#f8f4ff' : '#fff',
                            color: '#4a4a6a',
                            fontSize: 14,
                            cursor: hasVoted ? 'default' : 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>{option.text}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#764ba2' }}>{option.votes} {option.votes === 1 ? 'vote' : 'votes'}</span>
                            {hasVoted && <span style={{ fontSize: 12, color: '#667eea' }}>✓</span>}
                          </div>
                        </button>
                        {totalVotes > 0 && (
                          <div style={{ marginTop: 6, height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${percentage}%`, background: 'linear-gradient(135deg, #667eea, #764ba2)', transition: 'width 0.3s' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {(!data.polls || data.polls.length === 0) && <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888', background: '#fff', borderRadius: 16 }}><p>No polls yet. Create one to get group input!</p></div>}
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

// Planning Tab Component
function PlanningTab({ data, currentUser, addRec, voteRec, addBudgetTip, removeBudgetTip, addAnn, cardStyle }) {
  const [planningSection, setPlanningSection] = useState('recommendations'); // 'recommendations' or 'budget'
  
  if (!data) {
    return <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}>Loading...</div>;
  }
  
  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Planning</h2>
      <p style={{ color: '#888', marginBottom: 20 }}>Tips, recommendations, and budget-saving ideas for your trip!</p>
      
      {/* Section Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #f0e6ff', paddingBottom: 0 }}>
        <button 
          onClick={() => setPlanningSection('recommendations')}
          style={{ 
            padding: '12px 20px', 
            borderRadius: '10px 10px 0 0', 
            border: 'none', 
            borderBottom: planningSection === 'recommendations' ? '3px solid #667eea' : '3px solid transparent',
            background: planningSection === 'recommendations' ? '#fff' : 'transparent',
            color: planningSection === 'recommendations' ? '#667eea' : '#888',
            fontWeight: planningSection === 'recommendations' ? 600 : 400,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          💡 Recommendations
        </button>
        <button 
          onClick={() => setPlanningSection('budget')}
          style={{ 
            padding: '12px 20px', 
            borderRadius: '10px 10px 0 0', 
            border: 'none', 
            borderBottom: planningSection === 'budget' ? '3px solid #667eea' : '3px solid transparent',
            background: planningSection === 'budget' ? '#fff' : 'transparent',
            color: planningSection === 'budget' ? '#667eea' : '#888',
            fontWeight: planningSection === 'budget' ? 600 : 400,
            fontSize: 14,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          💰 Budget Tips
        </button>
      </div>

      {/* Recommendations Section */}
      {planningSection === 'recommendations' && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>💡 Recommendations</h3>
          <p style={{ color: '#888', marginBottom: 20, fontSize: 14 }}>Share your Disney wisdom! Vote on favorites.</p>
          <RecForm onAdd={addRec} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.recommendations || []).sort((a, b) => b.votes - a.votes).map(r => <div key={r.id} style={{ ...cardStyle, display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}><button onClick={() => voteRec(r.id)} disabled={(r.voters || []).includes(currentUser?.name)} style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid #ffe58f', background: '#fffbe6', fontSize: 20, cursor: 'pointer', opacity: (r.voters || []).includes(currentUser?.name) ? 0.5 : 1 }}>⭐</button><span style={{ fontWeight: 700, color: '#d48806' }}>{r.votes}</span></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>{r.category}</div><div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{r.title}</div>{r.description && <div style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>{r.description}</div>}<div style={{ fontSize: 12, color: '#aaa', marginTop: 8 }}>Added by {r.addedBy}</div></div>
            </div>)}
            {(!data.recommendations || data.recommendations.length === 0) && <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}><p>No recommendations yet!</p></div>}
          </div>
        </div>
      )}

      {/* Budget Tips Section */}
      {planningSection === 'budget' && (
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>💰 Budget Tips</h3>
          <p style={{ color: '#888', marginBottom: 20, fontSize: 14 }}>Money-saving tips to make your Disney trip more affordable!</p>
          <BudgetTipForm onAdd={addBudgetTip} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data.budgetTips || []).map(tip => (
              <div key={tip.id} style={{ ...cardStyle, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: '#f0e6ff', color: '#764ba2' }}>{tip.category}</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#4a4a6a', lineHeight: 1.5, marginBottom: 6 }}>{tip.text}</div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>Added by {tip.addedBy}</div>
                </div>
                {tip.addedBy !== 'System' && (
                  <button onClick={() => removeBudgetTip(tip.id)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fff0f0', color: '#f5576c', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>×</button>
                )}
              </div>
            ))}
            {(!data.budgetTips || data.budgetTips.length === 0) && <div style={{ textAlign: 'center', padding: '48px 24px', color: '#888' }}><p>No budget tips yet!</p></div>}
          </div>
        </div>
      )}

      {/* Announcements Section */}
      <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid #f0e6ff' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Announcements</h3>
        <AnnForm onAdd={addAnn} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{(data.announcements || []).map(a => <div key={a.id} style={{ background: '#f8f4ff', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 14, marginBottom: 8 }}>{a.text}</div><div style={{ fontSize: 12, color: '#888' }}>{a.author} • {new Date(a.time).toLocaleDateString()}</div></div>)}</div>
      </div>
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

function BudgetTipForm({ onAdd }) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('💡 General');
  const categories = ['🎟️ Tickets', '🍽️ Food & Dining', '📸 Photos & Souvenirs', '🏨 Lodging', '📱 Apps & Planning', '💡 General'];
  const submit = () => { if (!text.trim()) return; onAdd({ text: text.trim(), category }); setText(''); };
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, background: '#fff' }}>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Enter a budget-saving tip..." style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, boxSizing: 'border-box' }} />
      <button onClick={submit} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #52c41a, #73d13d)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', alignSelf: 'flex-start' }}>💰 Add Budget Tip</button>
    </div>
  );
}

function AnnForm({ onAdd }) {
  const [text, setText] = useState('');
  const submit = () => { if (!text.trim()) return; onAdd(text); setText(''); };
  return <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}><input type="text" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Type announcement..." style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14 }} /><button onClick={submit} style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid #e8e0f0', background: '#fff', color: '#666', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>Post</button></div>;
}

function PollForm({ onAdd }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  
  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };
  
  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };
  
  const submit = () => {
    if (!question.trim() || options.filter(opt => opt.trim()).length < 2) return;
    onAdd({
      question: question.trim(),
      options: options.filter(opt => opt.trim())
    });
    setQuestion('');
    setOptions(['', '']);
  };
  
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Poll question..."
        style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, boxSizing: 'border-box' }}
      />
      <div style={{ fontSize: 12, color: '#888', marginTop: -8 }}>Add at least 2 options</div>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={opt}
            onChange={e => updateOption(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #e8e0f0', fontSize: 14, boxSizing: 'border-box' }}
          />
          {options.length > 2 && (
            <button
              onClick={() => removeOption(idx)}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fff0f0', color: '#f5576c', fontSize: 16, cursor: 'pointer' }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {options.length < 6 && (
        <button
          onClick={addOption}
          style={{ padding: '10px 16px', borderRadius: 10, border: '1px dashed #e8e0f0', background: '#fafafa', color: '#888', fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' }}
        >
          + Add Option
        </button>
      )}
      <button
        onClick={submit}
        style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', alignSelf: 'flex-start' }}
      >
        Create Poll
      </button>
    </div>
  );
}

