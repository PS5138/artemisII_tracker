export const MISSION = {
  launch: new Date('2026-04-01T22:35:12Z'),
  splashdown: new Date('2026-04-11T00:21:00Z'), // confirmed from live tracker: 9d 2h mission
  orionHorizonsId: '-1024',
  moonHorizonsId: '301',
  humanDistanceRecord_km: 400171, // Apollo 13 (1970)
  targetMaxDistance_km: 407300,   // confirmed from live tracker
  crew: [
    {
      name: 'Reid Wiseman',
      role: 'Commander',
      agency: 'NASA',
      bio: 'U.S. Navy test pilot and veteran ISS commander. Led Expedition 41 in 2014.',
      fact: 'First person to tweet a vine from space.',
    },
    {
      name: 'Victor Glover',
      role: 'Pilot',
      agency: 'NASA',
      bio: 'U.S. Navy aviator, first Black astronaut to make a long-duration stay on the ISS.',
      fact: 'Completed four spacewalks during Crew-1 mission.',
    },
    {
      name: 'Christina Koch',
      role: 'Mission Specialist',
      agency: 'NASA',
      bio: 'Holds the record for longest single spaceflight by a woman (328 days).',
      fact: 'Participated in the first all-female spacewalk with Jessica Meir.',
    },
    {
      name: 'Jeremy Hansen',
      role: 'Mission Specialist',
      agency: 'CSA',
      bio: 'Canadian Space Agency astronaut, fighter pilot. First non-American on a lunar mission.',
      fact: 'First Canadian to fly beyond Earth orbit.',
    },
  ],
} as const

export type CrewMember = (typeof MISSION.crew)[number]

// Mission milestones — times in hours after launch
// Timings cross-referenced against issinfo.net live tracker on 2026-04-05
// (screenshot at T+3d 17h showed Lunar Flyby 1d 8h away → ~T+121h)
export const MILESTONES = [
  {
    id: 'launch',
    label: 'Launch',
    offsetHrs: 0,
    description: 'Artemis II lifts off from Kennedy Space Center on SLS Block 1',
  },
  {
    id: 'staging',
    label: 'Upper Stage Separation',
    offsetHrs: 0.17,
    description: 'ICPS separates; Orion continues under its own power',
  },
  {
    id: 'checkout',
    label: 'Earth Orbit & Checkout',
    offsetHrs: 1,
    description: 'Crew completes 1.5 Earth orbits verifying all Orion systems before departing',
  },
  {
    id: 'tli',
    label: 'Trans-Lunar Injection',
    offsetHrs: 3.5,
    description: 'Engine burn sends Orion on a free-return trajectory toward the Moon',
  },
  {
    id: 'ld',
    label: 'Lunar Flyby',
    offsetHrs: 121,
    description: 'Orion swings around the far side of the Moon — the Moon\'s gravity redirects it toward Earth',
  },
  {
    id: 'record',
    label: 'Human Distance Record',
    offsetHrs: 123,
    description: 'Orion reaches ~407,300 km — the farthest any human has ever been from Earth',
  },
  {
    id: 'return',
    label: 'Return Coast',
    offsetHrs: 125,
    description: 'Orion coasts back toward Earth, accelerating as Earth\'s gravity pulls it home',
  },
  {
    id: 'splashdown',
    label: 'Splashdown',
    offsetHrs: 217.8,
    description: 'Orion uses skip re-entry to shed speed across two atmosphere passes, splashing down in the Pacific',
  },
]

export function getMissionElapsed(from = new Date()): {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
} {
  const elapsed = from.getTime() - MISSION.launch.getTime()
  const totalSeconds = Math.max(0, Math.floor(elapsed / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, totalSeconds }
}

export function getNextMilestone(now = new Date()) {
  const elapsedHrs = (now.getTime() - MISSION.launch.getTime()) / 3600000
  return MILESTONES.find((m) => m.offsetHrs > elapsedHrs) ?? null
}

export function getMilestoneDate(milestone: (typeof MILESTONES)[number]): Date {
  return new Date(MISSION.launch.getTime() + milestone.offsetHrs * 3600000)
}

export function isMissionOver(now = new Date()): boolean {
  return now.getTime() > MISSION.splashdown.getTime()
}
