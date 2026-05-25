# Luxe Invite — Premium Digital Invitation System

A production-quality, VIP event invitation system with QR-based check-in, built with Next.js 15, Supabase, and Framer Motion.

---

## ✦ Features

- **Personal invite links** — each guest gets a unique, non-transferable URL
- **Embedded QR code** — generated client-side, encodes the check-in URL
- **One-scan security** — QR codes activate once; duplicate scans are rejected
- **Cinematic UI** — black/gold/ivory luxury aesthetic with Framer Motion animations
- **Staff scanner** — camera-based QR scanning for event staff
- **Real-time Supabase backend** — all state persisted, no mocks

---

## ✦ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL) |
| QR Generation | qrcode |
| QR Scanning | html5-qrcode |
| Fonts | Cormorant Garamond + Montserrat |

---

## ✦ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd luxe-invite
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
   - This creates the `invitations` table, indexes, RLS policies, and seed data
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Customize your event
NEXT_PUBLIC_EVENT_NAME="An Evening of Elegance"
NEXT_PUBLIC_CELEBRANT_NAME="Mama Grace"
NEXT_PUBLIC_EVENT_DATE="2025-03-15T18:00:00"
NEXT_PUBLIC_EVENT_VENUE="The Grand Ballroom, Victoria Island, Lagos"
NEXT_PUBLIC_EVENT_ADDRESS="123 Ocean Drive, Victoria Island, Lagos, Nigeria"
NEXT_PUBLIC_GOOGLE_MAPS_URL="https://maps.google.com/?q=Victoria+Island+Lagos"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✦ Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — luxury marketing |
| `/invite/[invite_code]` | Guest's personal invitation with QR code |
| `/checkin/[invite_code]` | Check-in endpoint (opened when QR is scanned) |
| `/scanner` | Staff camera scanner |

---

## ✦ How Check-In Works

```
Guest opens /invite/[code]
  → QR code displayed (encodes /checkin/[code])
  → Staff scans QR with /scanner
  → Redirected to /checkin/[code]
  → Server fetches invitation from Supabase
  → If checked_in = false:
      UPDATE checked_in = true, checked_in_at = now()
      → Show green SUCCESS screen
  → If checked_in = true:
      → Show red ALREADY USED screen
```

The update uses **optimistic locking** (`WHERE checked_in = false`) to prevent race conditions in case two scanners scan simultaneously.

---

## ✦ Seeding Guests

**Option A** — SQL (already included in `schema.sql`):
The schema file includes 8 sample guests with `demo-guest-001` through `demo-guest-008` codes.

**Option B** — Programmatic (generates unique codes):
```bash
npm run seed
```
This outputs invite URLs for each guest ready to share.

**Option C** — Supabase Dashboard:
Insert directly via the Table Editor in your Supabase project.

---

## ✦ Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── globals.css             # Design tokens, animations
│   ├── page.tsx                # Landing page
│   ├── not-found.tsx           # 404 page
│   ├── invite/[invite_code]/
│   │   └── page.tsx            # Invitation page (server)
│   ├── checkin/[invite_code]/
│   │   └── page.tsx            # Check-in handler (server, force-dynamic)
│   └── scanner/
│       └── page.tsx            # Scanner page
│
├── components/
│   ├── ui/
│   │   ├── QRDisplay.tsx       # QR code renderer
│   │   └── CountdownTimer.tsx  # Live countdown
│   ├── invite/
│   │   ├── InviteCard.tsx      # Main invitation UI
│   │   └── AlreadyUsedCard.tsx # Already-used state
│   ├── checkin/
│   │   ├── CheckInSuccess.tsx  # Green success screen
│   │   └── CheckInError.tsx    # Red error screen
│   └── scanner/
│       └── ScannerView.tsx     # Camera QR scanner
│
├── lib/
│   ├── supabase.ts             # Supabase client
│   ├── invitations.ts          # Data access layer
│   └── config.ts               # Event configuration
│
└── types/
    └── index.ts                # TypeScript types

supabase/
└── schema.sql                  # Table, RLS, seed data

scripts/
└── seed.ts                     # Programmatic seeder
```

---

## ✦ Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_APP_URL  # your production domain
```

After deploying, update `NEXT_PUBLIC_APP_URL` to your production URL (e.g., `https://luxe-invite.vercel.app`) so QR codes encode the correct check-in URLs.

---

## ✦ Security Notes

- **Invite codes as passwords**: The `invite_code` is a secret URL segment. Use UUID-based codes (from the seed script) in production, not sequential numbers.
- **RLS enabled**: Supabase Row Level Security is active. Currently set to allow public reads (guests can view their own invitation) and updates (for check-in). For higher security, use a **service role key** in a server-side API route for the check-in update.
- **One-time use**: The optimistic locking (`WHERE checked_in = false`) in `performCheckIn()` ensures atomicity even with concurrent scans.

---

## ✦ Customization

- **Event details** — all in `.env.local` (name, date, venue, celebrant)
- **Colors** — edit `tailwind.config.ts` and `globals.css`
- **Fonts** — swap in `layout.tsx` (currently Cormorant Garamond + Montserrat)
- **QR styling** — edit `QRDisplay.tsx` (colors, size, error correction level)

---

*Luxe Invite — Where every entry is an experience.*
