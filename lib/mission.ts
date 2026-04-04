export const MISSION = {
  launch: new Date('2026-04-01T22:35:12Z'),
  splashdown: new Date('2026-04-10T18:00:00Z'),
  orionHorizonsId: '-1024',
  moonHorizonsId: '301',
  humanDistanceRecord_km: 400171, // Apollo 13 (1970)
  targetMaxDistance_km: 406000,
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
export const MILESTONES = [
  { id: 'launch', label: 'Launch', offsetHrs: 0, description: 'Artemis II lifts off from Kennedy Space Center' },
  { id: 'staging', label: 'Upper Stage Separation', offsetHrs: 0.17, description: 'ICPS separates; Orion on its own' },
  { id: 'tli', label: 'Trans-Lunar Injection', offsetHrs: 1.5, description: 'Burn sends Orion toward the Moon' },
  { id: 'record', label: 'Human Distance Record', offsetHrs: 70, description: 'Orion breaks Apollo 13\'s 400,171 km record — farthest humans from Earth' },
  { id: 'ld', label: 'Lunar Close Approach', offsetHrs: 73, description: 'Orion swings within ~8,900 km of the Moon' },
  { id: 'return', label: 'Return Trajectory Burn', offsetHrs: 80, description: 'Orion burns to set course for Earth' },
  { id: 'splashdown', label: 'Splashdown', offsetHrs: 214, description: 'Crew module splashes down in Pacific Ocean' },
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
