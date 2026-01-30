# 🏰 Disney Family Trip Planner

A magical, collaborative trip planner for your Disney family vacation!

## Quick Deploy to Vercel

### Option 1: Via GitHub (Recommended)

1. **Create a new GitHub repo** and upload these files
2. **Go to Vercel** → New Project → Import your repo
3. **Click Deploy** - that's it!

### Option 2: Via Vercel CLI

```bash
npm install -g vercel
cd disney-vercel
vercel
```

## Features

- ✨ Magic wand & glitter animations on login
- 📅 Accordion-style itinerary with drag & drop reordering
- 👑 Family contacts with room assignments
- 🏠 Lodging info with Google Maps link
- 💡 Tips & recommendations with voting
- 📣 Group announcements
- 🚨 Emergency info & daily checklist
- 📝 Activity feed showing who made changes

## Password

Default password: `Disney2026`

To change it, edit `src/App.jsx` and find:
```javascript
password: "Disney2026"
```

## Storage

**Current setup:** Uses localStorage (each device has its own data)

**For shared/collaborative storage:** See the bottom of `src/App.jsx` for Firebase instructions.

## Local Development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Build for Production

```bash
npm run build
```

Output will be in the `dist` folder.

---

✨ Have a magical trip! ✨
