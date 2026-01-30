# Disney Family Trip Planner - Cursor Handoff Document

## Project Overview
A collaborative Disney family trip planner with magical UI effects. Deployed on Vercel at `disney-family-trip.vercel.app`.

## Tech Stack
- **Frontend:** React 18 + Vite
- **Styling:** Inline styles (no CSS framework)
- **Storage:** Currently localStorage (needs Supabase integration)
- **Hosting:** Vercel (auto-deploys from GitHub)

## GitHub Repo
`https://github.com/bradrhodes-arch/Disney-family-trip`

## Getting Started in Cursor
```bash
git clone https://github.com/bradrhodes-arch/Disney-family-trip.git
cd Disney-family-trip
npm install
npm run dev
```

---

## PRIORITY TASK: Add Supabase for Shared/Collaborative Storage

### Why
Currently each device has its own localStorage data. Family members can't see each other's edits. Need real-time sync so everyone sees the same data.

### Supabase Setup Steps

1. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Note the `Project URL` and `anon/public` API key

2. **Create Table**
   Run this SQL in Supabase SQL Editor:
   ```sql
   CREATE TABLE trip_data (
     id TEXT PRIMARY KEY DEFAULT 'disney-family-trip-2026',
     data JSONB NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable real-time
   ALTER PUBLICATION supabase_realtime ADD TABLE trip_data;

   -- Allow public access (protected by app password)
   CREATE POLICY "Allow all" ON trip_data FOR ALL USING (true);
   ```

3. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Update src/App.jsx**
   
   Replace the storage helper at the top with:
   ```javascript
   import { createClient } from '@supabase/supabase-js';

   const supabase = createClient(
     'YOUR_SUPABASE_URL',
     'YOUR_SUPABASE_ANON_KEY'
   );

   const STORAGE_KEY = 'disney-family-trip-2026';

   const storage = {
     async get(key) {
       const { data, error } = await supabase
         .from('trip_data')
         .select('data')
         .eq('id', key)
         .single();
       
       if (error || !data) return null;
       return { value: JSON.stringify(data.data) };
     },
     
     async set(key, value) {
       const { error } = await supabase
         .from('trip_data')
         .upsert({ 
           id: key, 
           data: JSON.parse(value),
           updated_at: new Date().toISOString()
         });
       
       return error ? null : { success: true };
     }
   };
   ```

5. **Add Real-time Subscription** (optional but nice)
   Add this inside the App component after state declarations:
   ```javascript
   // Real-time sync - updates when others make changes
   useEffect(() => {
     const channel = supabase
       .channel('trip-changes')
       .on('postgres_changes', 
         { event: 'UPDATE', schema: 'public', table: 'trip_data' },
         (payload) => {
           if (payload.new.id === STORAGE_KEY) {
             setData(payload.new.data);
           }
         }
       )
       .subscribe();

     return () => supabase.removeChannel(channel);
   }, []);
   ```

6. **Add Environment Variables**
   Create `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
   
   Update code to use:
   ```javascript
   const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   );
   ```

7. **Add env vars to Vercel**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

---

## Current Features

### Authentication
- Password gate: "Disney2026" (client-side, stored in data.tripInfo.password)
- Name entry for edit tracking (stored in currentUser state)

### Data Structure
```javascript
{
  tripInfo: { title, dates, groupSize, password },
  lodging: { name, address, vrboLink, checkIn, checkOut, notes },
  days: [
    { id, date, label, theme, activities: [{ text, editedBy }] }
  ],
  contacts: [{ id, name, phone, email, room, notes, addedBy }],
  emergency: { hospital, pharmacy, emergencyContact, meetingSpot },
  recommendations: [{ id, title, description, category, votes, addedBy, voters }],
  announcements: [{ id, text, author, time }],
  editHistory: [{ user, action, time }]
}
```

### Tabs
1. **Itinerary** - Accordion days with drag & drop activities
2. **Family** - Contact cards with room assignments
3. **Lodging** - Property info with Google Maps link
4. **Tips** - Recommendations with voting
5. **Emergency** - Important contacts + daily checklist
6. **Activity** - Edit history feed

### Visual Effects
- Floating sparkles (background)
- Magic wand animation (on unlock)
- Glitter rain (on unlock)
- Castle SVG logo

---

## Requested Design Changes (TODO)

The user may want to redesign certain aspects. Common requests might include:

1. **Mobile responsiveness improvements**
2. **Different color themes**
3. **Additional tabs/features**
4. **Better drag & drop on touch devices**
5. **Print/export functionality**

---

## File Structure
```
Disney-family-trip/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
└── src/
    ├── main.jsx      (React entry point)
    └── App.jsx       (Main component - all code here)
```

## Deployment
- Push to `main` branch → Vercel auto-deploys
- Live URL: disney-family-trip.vercel.app

---

## Style Guide

### Colors
- Primary gradient: `linear-gradient(135deg, #667eea, #764ba2)`
- Background: `linear-gradient(180deg, #fdf6f9, #fff, #f0e6ff)`
- Text: `#4a4a6a`
- Accent: `#764ba2`
- Success: `#52c41a`
- Warning: `#d48806`
- Error: `#f5576c`

### Theme Colors (by day type)
- arrival: `#667eea` ✈️
- park: `#f5576c` 🏰
- rest: `#4facfe` 🏊
- departure: `#43e97b` 🚗

### Typography
- Font: `system-ui, -apple-system, sans-serif`
- Headings: 700 weight
- Body: 400 weight

### Components
- Cards: `borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)'`
- Buttons: `borderRadius: 10`
- Inputs: `borderRadius: 10, border: '1px solid #e8e0f0'`

---

## Quick Commands

```bash
# Local dev
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Push changes (triggers Vercel deploy)
git add .
git commit -m "your message"
git push
```
