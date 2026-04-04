# Artemis II Live Tracker

A locally-hosted real-time mission dashboard for NASA's Artemis II — the first crewed mission beyond low Earth orbit since Apollo 17 in 1972. Tracks the Orion spacecraft live using JPL's Horizons ephemeris system, with space weather monitoring, crew info, mission milestones, and a 3D visualisation of the Earth–Moon system.

![Artemis II Tracker](Screenshots/Screenshot%202026-04-04%20at%2015.46.28.png)

---

## Running locally

No API keys required. All data sources are free and open.

```bash
git clone https://github.com/PS5138/artemisII_tracker.git
cd artemisII_tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Node 18+ required.

---

## What's on screen

### 3D Visualisation (left panel)

A live Three.js scene rendered at true scale (1 scene unit = 500,000 km):

- **Earth** — textured sphere (NASA Blue Marble 2K + normal map), slowly rotating
- **Moon** — textured sphere (LRO mosaic 1K), positioned from real Horizons vectors
- **Orion marker** — pulsing cyan diamond at Orion's real-time position; hover to reveal label
- **Trajectory path** — cyan trail drawn from the last 300 polled position vectors
- **Stars** — procedural star field

Drag to rotate, scroll to zoom. The collapse arrow on the right edge hides the panel to give the scene full width.

### Right panel (two columns)

| Left column | Right column |
|---|---|
| Mission Elapsed Time | Space Weather |
| Live Telemetry | Apollo 13 Comparison |
| Human Distance Record | Mission Timeline |
| In Perspective | Crew |

---

## Data sources

### Orion position — JPL Horizons API

**Endpoint:** `https://ssd.jpl.nasa.gov/api/horizons.api`  
**Polled every:** 60 seconds via `/api/telemetry`  
**Object ID:** `-1024` (Artemis II / Orion)

Returns X, Y, Z position vectors and velocity vectors in km / km·s⁻¹ in an Earth-centred J2000 reference frame. The app derives:

| Metric | Calculation |
|---|---|
| Distance from Earth | Magnitude of position vector `√(x²+y²+z²)` |
| Distance from Moon | Vector difference between Orion and Moon positions |
| Speed | Magnitude of velocity vector `√(vx²+vy²+vz²)` |
| Speed (mph) | `speed_kms × 3600 × 0.621371` |
| Light delay | `distance_km / 299,792 km·s⁻¹` |

The Moon's position (object `301`) is fetched in the same poll. Both requests run in parallel.

> **Note on Orion data:** JPL Horizons will only return trajectory data for `-1024` once NASA has registered the spacecraft with the JPL navigation team. If the API returns no ephemeris block, the telemetry panel shows an error and Orion's marker holds its last known position.

### Space weather — NOAA SWPC

**Polled every:** 5 minutes via `/api/spaceweather`  
Three separate feeds are fetched in parallel:

| Feed | URL | What it provides |
|---|---|---|
| Solar flares | `.../goes/primary/xrays-7-day.json` | X-ray flux from GOES satellites over the last 7 days |
| Kp index | `.../planetary_k_index_1m.json` | Geomagnetic storm index (0–9 scale), 1-minute cadence |
| Particle flux | `.../ace/ace_epam_5m.json` | Energetic electron count from the ACE spacecraft at L1 |

**How status is calculated:**

| Status | Condition |
|---|---|
| 🟢 GREEN | Kp < 4, no M/X-class flares, particle flux < 1,000 pfu |
| 🟡 AMBER | Kp ≥ 4 or any M-class flare in last 24h |
| 🔴 RED | Kp ≥ 7, any X-class flare, or particle flux > 10,000 pfu |

Solar flares are detected by scanning the 7-day X-ray flux time series for sustained readings above M-class threshold (≥ 1×10⁻⁵ W/m²), grouped into events with a 3-reading gap tolerance.

### Apollo 13 comparison — static reference data

There is no live API for historical mission telemetry. The Apollo 13 distance curve is reconstructed from a static lookup table of verified mission events in `lib/apollo.ts`, with linear interpolation between anchor points:

| Mission elapsed time | Event | Distance from Earth |
|---|---|---|
| T+0h | Launch | ~6,371 km (surface) |
| T+55.9h | Oxygen tank explosion | ~321,000 km |
| T+73.5h | **Maximum distance (record set)** | **400,171 km** |
| T+77.1h | Lunar closest approach | ~396,000 km |
| T+141.9h | Splashdown | ~6,371 km |

Intermediate values are accurate to within approximately ±5,000 km. The record distance and event timestamps are from NASA mission records.

### Mission milestones — static schedule

Defined in `lib/mission.ts` from NASA's published Artemis II timeline. Times are offsets from launch (`2026-04-01T22:35:12Z`):

| Milestone | T+ (hours) |
|---|---|
| Launch | 0 |
| Upper Stage Separation | 0.17 |
| Trans-Lunar Injection | 1.5 |
| Human Distance Record | 70 |
| Lunar Closest Approach | 73 |
| Return Trajectory Burn | 80 |
| Splashdown | 214 |

---

## Architecture

```
artemisII_tracker/
├── app/
│   ├── page.tsx                    # Root layout — 3D scene + 2-col sidebar
│   ├── layout.tsx                  # HTML shell, fonts, metadata
│   └── api/
│       ├── telemetry/route.ts      # Server route → JPL Horizons (avoids CORS)
│       └── spaceweather/route.ts   # Server route → NOAA SWPC (avoids CORS)
├── components/
│   ├── scene/
│   │   ├── SpaceScene.tsx          # Three.js Canvas, lights, scale
│   │   ├── EarthGlobe.tsx          # Textured Earth sphere + atmosphere glow
│   │   ├── MoonGlobe.tsx           # Textured Moon sphere
│   │   ├── OrionMarker.tsx         # Pulsing diamond marker, hover label
│   │   ├── TrajectoryPath.tsx      # Line drawn from position history
│   │   └── CameraController.tsx   # Smooth camera lerp inside Canvas
│   └── panels/
│       ├── METClock.tsx            # Live mission elapsed time (ticks every second)
│       ├── TelemetryPanel.tsx      # Distances, speed, light delay, velocity trend
│       ├── RecordTracker.tsx       # Progress bar to Apollo 13 distance record
│       ├── ContextFacts.tsx        # Rotating position-aware comparison facts
│       ├── SpaceWeatherPanel.tsx   # NOAA status, Kp, flares, particle flux
│       ├── ApolloCmp.tsx           # Side-by-side comparison with Apollo 13
│       ├── MilestonePanel.tsx      # Mission timeline with live countdown
│       ├── CrewPanel.tsx           # Crew bios and current activity
│       └── InfoPopup.tsx           # Shared 'i' tooltip component (portal-based)
├── lib/
│   ├── horizons.ts                 # JPL Horizons API client + vector parser
│   ├── spaceweather.ts             # NOAA SWPC client + status logic
│   ├── mission.ts                  # Mission constants, crew, milestones
│   ├── apollo.ts                   # Apollo 13 reference trajectory + interpolation
│   ├── facts.ts                    # Dynamic comparison fact generator
│   ├── store.ts                    # Zustand global state (telemetry, weather, history)
│   └── DataPoller.tsx              # Client component driving the polling loops
└── public/
    └── textures/
        ├── earth.jpg               # NASA Blue Marble 2K (via Three.js examples)
        ├── earth_normal.jpg        # Earth normal map
        └── moon.jpg                # LRO lunar mosaic 1K
```

**Stack:** Next.js 16 · React 19 · Three.js 0.183 · @react-three/fiber · @react-three/drei · Zustand 5 · Tailwind CSS 4 · TypeScript

---

## Crew

| Name | Role | Agency |
|---|---|---|
| Reid Wiseman | Commander | NASA |
| Victor Glover | Pilot | NASA |
| Christina Koch | Mission Specialist | NASA |
| Jeremy Hansen | Mission Specialist | CSA |

Jeremy Hansen is the first non-American to fly on a lunar mission. Christina Koch holds the record for the longest single spaceflight by a woman (328 days).
