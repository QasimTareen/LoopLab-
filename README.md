# LoopLab — Student Tech Community Platform

A full-stack web application for managing student applications, core members, and team structure for the LoopLab & LoopTech student community.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend/DB:** Firebase (Firestore + Auth)
- **Build Tool:** Vite
- **Deployment:** Vercel

## Features

- 🎮 **VP Assessment** — Gamified critical thinking simulator for Vice President applicants
- 📋 **Student Application Form** — Position-based applications with role-specific flows
- 👥 **Core Member Directory** — Browse and manage core team members
- 🛡️ **Admin Portal** — Review, approve, or reject applications with notes
- 🔐 **Security Portal** — Admin authentication with role-based access
- 🎬 **Intro Cinematic** — Animated onboarding experience

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore enabled

### Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd looplab
   npm install
   ```

2. **Configure Firebase:**
   - Create a `.env` file in the root:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Deploy Firestore rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── App.tsx                    # Root component & routing logic
├── main.tsx                   # Entry point
├── types.ts                   # TypeScript interfaces
├── index.css                  # Global styles
├── components/
│   ├── GamingAssessment.tsx   # VP critical thinking simulator
│   ├── StudentApplicationForm.tsx  # Application form
│   ├── AdminPortalDashboard.tsx    # Admin review panel
│   ├── SecurityPortal.tsx     # Admin login
│   ├── CoreDirectory.tsx      # Member directory
│   ├── MemberForm.tsx         # Add/edit members
│   ├── TeamForm.tsx           # Team management
│   ├── Hero3DHeader.tsx       # Landing hero section
│   ├── IntroCinematic.tsx     # Intro animation
│   ├── StatsGrid.tsx          # Stats display
│   └── Toast.tsx              # Notification component
└── lib/                       # Firebase utilities
```

## VP Assessment Scoring

The Vice President assessment consists of 6 scenario-based questions, each worth up to 5 points (max score: 30). Verdicts:

| Score | Verdict |
|-------|---------|
| 25–30 | Master Tactician |
| 19–24 | High Strategist |
| 12–18 | Tactical Lead |
| 0–11  | Needs Training |

## License

See [LICENSE](LICENSE) for details.
