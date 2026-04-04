# 🚀 Artemis II Live Tracker — Project Plan

## Overview

A locally-hosted Next.js web app that provides a dramatically better tracking experience than NASA's AROW. Real-time telemetry from JPL Horizons, immersive 3D visualisation, contextual facts, space weather, and crew info — all running on `localhost:3000`.

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | Next.js 14 (TypeScript) | Same pattern as EU AI Act repo — single monorepo, no separate backend |
| 3D Scene | Three.js + `@react-three/fiber` + `@react-three/drei` | Smooth orbit controls, camera transitions, real trajectory rendering |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, dark-mode-first |
| Data — Position | JPL Horizons API (`ssd.jpl.nasa.gov/api/horizons.api`) | Real X/Y/Z vectors for Orion (object `-1024`), polled every 60s |
| Data — Space Weather | NOAA SWPC API (`services.swpc.noaa.gov`) | Free, no key, solar flare/CME/geomagnetic storm data |
| Data — Mission Schedule | Static JSON (from published NASA timeline) | Mission milestones, crew schedule |
| API Layer | Next.js API routes | Proxies Horizons + NOAA calls server-side to avoid CORS |

---

## Repository Structure

```
artemis-tracker/
├── app/
│   ├── page.tsx                  # Main dashboard
│   ├── layout.tsx
│   └── api/
│       ├── telemetry/route.ts    # Proxies JPL Horizons, returns parsed position + velocity
│       └── spaceweather/route.ts # Proxies NOAA SWPC
├── components/
│   ├── scene/
│   │   ├── SpaceScene.tsx        # Root Three.js canvas
│   │   ├── OrionSpacecraft.tsx   # Orion model/marker with glow
│   │   ├── EarthGlobe.tsx        # Textured Earth sphere
│   │   ├── MoonGlobe.tsx         # Textured Moon sphere
│   │   ├── TrajectoryPath.tsx    # Drawn from Horizons vector history
│   │   └── CameraController.tsx # Smooth transitions: overview / Orion / Moon
│   ├── panels/
│   │   ├── TelemetryPanel.tsx    # Distance, velocity, elapsed time — live
│   │   ├── MilestonePanel.tsx    # Next milestone + countdown
│   │   ├── RecordTracker.tsx     # Progress bar to human distance record (252,000 mi)
│   │   ├── LightDelayPanel.tsx   # Radio signal travel time to Orion
│   │   ├── ContextFacts.tsx      # Dynamic facts based on current position
│   │   ├── SpaceWeather.tsx      # Solar flare/CME traffic light + detail
│   │   ├── CrewPanel.tsx         # Crew bios + what they're doing now
│   │   └── ApolloCmp.tsx         # Where Apollo 13 was at same mission elapsed time
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── horizons.ts               # Horizons API client + vector parser
│   ├── spaceweather.ts           # NOAA SWPC client
│   ├── mission.ts                # Mission constants, timeline, milestones
│   ├── facts.ts                  # Contextual fact generator (position-aware)
│   └── apollo.ts                 # Apollo mission reference data
├── public/
│   └── textures/                 # Earth, Moon, star field textures
├── .env.example
└── README.md
```

---

## Data Sources

### JPL Horizons API — Orion Position (primary)
```
GET https://ssd.jpl.nasa.gov/api/horizons.api
  ?format=json
  &COMMAND='-1024'          # Artemis II / Orion "Integrity"
  &EPHEM_TYPE='VECTORS'     # Returns X, Y, Z position + velocity vectors
  &CENTER='500@399'         # Earth centre reference frame
  &START_TIME='<now>'
  &STOP_TIME='<now+1h>'
  &STEP_SIZE='1h'
```
Returns: position (km), velocity (km/s) in Earth-centred J2000 frame. Poll every 60s via `/api/telemetry`.

Derived metrics computed client-side:
- Distance from Earth (magnitude of position vector)
- Distance from Moon (Moon position from same API, subtract)
- Speed (magnitude of velocity vector)
- Light delay (`distance_km / 299,792 km/s`)
- Acceleration trend (delta velocity vs previous poll)

### NOAA SWPC — Space Weather
```
GET https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json   # Solar flares
GET https://services.swpc.noaa.gov/json/planetary_k_index_1m.json        # Geomagnetic
GET https://services.swpc.noaa.gov/json/ace/ace_epam_5m.json             # Particle events
```
Poll every 5 minutes. Aggregate into a single GREEN / AMBER / RED status.

---

## Features — Full Build (V1 + V2 combined)

### 🌌 3D Space Scene
- [ ] Textured Earth sphere (NASA Blue Marble texture)
- [ ] Textured Moon sphere, correctly positioned relative to Earth
- [ ] Orion spacecraft marker with subtle pulsing glow
- [ ] Real trajectory line drawn from Horizons vector history (updates as mission progresses)
- [ ] Star field background (either texture or procedural points)
- [ ] Three camera presets with smooth transitions:
  - **Overview** — full Earth-Moon system visible
  - **Lock on Orion** — camera follows spacecraft
  - **Moon approach** — cinematic pull-in as Orion nears Moon
- [ ] Free drag/rotate/zoom with `@react-three/drei` OrbitControls
- [ ] Scale toggle: true scale vs compressed scale (true scale makes Earth/Moon tiny — offer both)

### 📡 Live Telemetry Panel
- [ ] Distance from Earth (miles + km)
- [ ] Distance from Moon (miles + km)  
- [ ] Current velocity (mph + km/s)
- [ ] Mission elapsed time (D:H:M:S live clock)
- [ ] Velocity trend indicator (↑ accelerating / ↓ decelerating)
- [ ] All figures animate smoothly between polls

### 🏆 Record Tracker
- [ ] Progress bar: current distance vs human record (252,000 miles, set on this mission)
- [ ] "New record set!" moment — celebratory animation when Orion passes the Apollo 13 record
- [ ] Comparison: distance at same MET for Apollo 8, Apollo 13

### ⏱️ Mission Timeline & Milestones
- [ ] Full published mission schedule as a visual timeline
- [ ] Current position highlighted on timeline
- [ ] "Next milestone" card with live countdown (e.g. "Lunar closest approach in 1d 4h 32m")
- [ ] Completed milestones ticked off

### 💡 Contextual Facts (dynamic, position-aware)
Facts update automatically as Orion moves. Examples:
- *"Earth subtends 2.3° from Orion right now — about 4.6x the Moon's apparent size from Earth"*
- *"A 100 mph car would take [X] years to cover this distance"*  
- *"Orion is now farther from Earth than any human has been since Apollo 13 (1970)"*
- *"You are watching history — this is the first crewed mission beyond LEO since December 1972"*
- *"Radio signals from Mission Control take [X] seconds to reach the crew"*
- *"The crew is travelling at [X] mph — [Y]x faster than a commercial aircraft"*
- *"At this distance, the Moon's gravity is pulling Orion [direction]"*

### 📻 Radio / Light Delay
- [ ] Live: "It takes X.Xs for a signal to reach Orion right now"
- [ ] Visual: pulsing animation showing signal travel time
- [ ] Context: "NASA's Deep Space Network is tracking Orion via [Goldstone / Madrid / Canberra] dish"

### ☀️ Space Weather Panel
- [ ] Traffic light: GREEN / AMBER / RED with explanation
- [ ] Solar flare log (last 24h) — X/M/C class events
- [ ] Geomagnetic storm index (Kp)
- [ ] Relevance context: *"Beyond Earth's magnetosphere, the crew's radiation exposure is elevated during M/X-class events. Orion's crew module provides [X] g/cm² shielding."*
- [ ] Historical: how current conditions compare to average

### 👨‍🚀 Crew Panel
- [ ] Bios: Reid Wiseman (Commander), Victor Glover (Pilot), Christina Koch (MS), Jeremy Hansen (MS — first non-American on a lunar mission)
- [ ] Current crew activity based on published schedule (e.g. "Sleep period", "Proximity ops demo", "Translunar coast")
- [ ] Fun facts per crew member

### 🌍 Apollo Comparison
- [ ] Ghost trajectory overlay: where Apollo 8 / Apollo 13 was at the same mission elapsed time
- [ ] Side-by-side metric comparison card
- [ ] Key differences: spacecraft mass, crew size, mission objective

---

## Setup Instructions (for README)

```bash
# 1. Clone and install
git clone <repo>
cd artemis-tracker
npm install

# 2. Environment (no keys needed — all APIs are public)
cp .env.example .env.local

# 3. Run
npm run dev
# → http://localhost:3000
```

No API keys required. All data sources (JPL Horizons, NOAA SWPC) are free and open.

---

## Build Phases

### Phase 1 — Scaffold + Data Pipeline (do first)
- Next.js project setup
- `/api/telemetry` route parsing Horizons vectors
- `/api/spaceweather` route aggregating NOAA
- Basic telemetry panel rendering live numbers
- Confirm data is flowing end-to-end

### Phase 2 — 3D Scene
- Three.js canvas with Earth, Moon, Orion
- OrbitControls drag/rotate
- Camera presets
- Trajectory line

### Phase 3 — All Panels
- Milestone timeline
- Record tracker
- Contextual facts engine
- Light delay
- Space weather
- Crew panel
- Apollo comparison

### Phase 4 — Polish
- Cinematic aesthetic (dark space, glows, smooth animations)
- Responsive layout
- Performance (memoisation, efficient re-renders)
- README

---

## Key Constants

```typescript
export const MISSION = {
  launch: new Date('2026-04-01T22:35:12Z'),
  splashdown: new Date('2026-04-10T18:00:00Z'), // approx
  orionHorizonsId: '-1024',
  humanDistanceRecord_km: 400171, // Apollo 13 (1970) — Orion expected to break this
  targetMaxDistance_km: 406000,   // ~252,000 miles
  crew: ['Reid Wiseman', 'Victor Glover', 'Christina Koch', 'Jeremy Hansen'],
}
```

---

## Notes

- JPL Horizons trajectory data starts slightly after launch (first data point ~3hrs in) — bridge the gap with a synthetic launch arc as done in community trackers
- AROW state vectors may become available mid-mission from nasa.gov/trackartemis — worth checking periodically as a second source to cross-validate Horizons
- Mission ends ~April 10 — build fast!
