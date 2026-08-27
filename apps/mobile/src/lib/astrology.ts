// ─── Zodiac Signs ──────────────────────────────────────────────────────────────

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  ruling: string;
  dates: string;
  color: string;
  traits: string[];
}

export const ZODIAC: ZodiacSign[] = [
  { id: "aries",       name: "Aries",       symbol: "♈", emoji: "🐏", element: "Fire",  modality: "Cardinal", ruling: "Mars",    dates: "Mar 21 – Apr 19", color: "#e84c3d", traits: ["Bold","Trailblazing","Energetic"] },
  { id: "taurus",      name: "Taurus",      symbol: "♉", emoji: "🐂", element: "Earth", modality: "Fixed",    ruling: "Venus",   dates: "Apr 20 – May 20", color: "#27ae60", traits: ["Grounded","Loyal","Tenacious"] },
  { id: "gemini",      name: "Gemini",      symbol: "♊", emoji: "👯", element: "Air",   modality: "Mutable",  ruling: "Mercury", dates: "May 21 – Jun 20", color: "#f39c12", traits: ["Curious","Versatile","Expressive"] },
  { id: "cancer",      name: "Cancer",      symbol: "♋", emoji: "🦀", element: "Water", modality: "Cardinal", ruling: "Moon",    dates: "Jun 21 – Jul 22", color: "#2980b9", traits: ["Intuitive","Nurturing","Creative"] },
  { id: "leo",         name: "Leo",         symbol: "♌", emoji: "🦁", element: "Fire",  modality: "Fixed",    ruling: "Sun",     dates: "Jul 23 – Aug 22", color: "#e67e22", traits: ["Magnetic","Generous","Visionary"] },
  { id: "virgo",       name: "Virgo",       symbol: "♍", emoji: "🌾", element: "Earth", modality: "Mutable",  ruling: "Mercury", dates: "Aug 23 – Sep 22", color: "#16a085", traits: ["Analytical","Precise","Devoted"] },
  { id: "libra",       name: "Libra",       symbol: "♎", emoji: "⚖️", element: "Air",   modality: "Cardinal", ruling: "Venus",   dates: "Sep 23 – Oct 22", color: "#8e44ad", traits: ["Balanced","Charming","Strategic"] },
  { id: "scorpio",     name: "Scorpio",     symbol: "♏", emoji: "🦂", element: "Water", modality: "Fixed",    ruling: "Pluto",   dates: "Oct 23 – Nov 21", color: "#c0392b", traits: ["Intense","Perceptive","Transformative"] },
  { id: "sagittarius", name: "Sagittarius", symbol: "♐", emoji: "🏹", element: "Fire",  modality: "Mutable",  ruling: "Jupiter", dates: "Nov 22 – Dec 21", color: "#d35400", traits: ["Expansive","Philosophical","Free"] },
  { id: "capricorn",   name: "Capricorn",   symbol: "♑", emoji: "🐐", element: "Earth", modality: "Cardinal", ruling: "Saturn",  dates: "Dec 22 – Jan 19", color: "#2c3e50", traits: ["Disciplined","Ambitious","Patient"] },
  { id: "aquarius",    name: "Aquarius",    symbol: "♒", emoji: "🏺", element: "Air",   modality: "Fixed",    ruling: "Uranus",  dates: "Jan 20 – Feb 18", color: "#1abc9c", traits: ["Innovative","Visionary","Independent"] },
  { id: "pisces",      name: "Pisces",      symbol: "♓", emoji: "🐟", element: "Water", modality: "Mutable",  ruling: "Neptune", dates: "Feb 19 – Mar 20", color: "#9b59b6", traits: ["Empathic","Intuitive","Dreamy"] },
];

// ─── Sun Sign from Date of Birth ───────────────────────────────────────────────

export function getSunSign(month: number, day: number): ZodiacSign {
  const md = month * 100 + day;
  if (md >= 321 && md <= 419) return ZODIAC[0];  // Aries
  if (md >= 420 && md <= 520) return ZODIAC[1];  // Taurus
  if (md >= 521 && md <= 620) return ZODIAC[2];  // Gemini
  if (md >= 621 && md <= 722) return ZODIAC[3];  // Cancer
  if (md >= 723 && md <= 822) return ZODIAC[4];  // Leo
  if (md >= 823 && md <= 922) return ZODIAC[5];  // Virgo
  if (md >= 923 && md <= 1022) return ZODIAC[6]; // Libra
  if (md >= 1023 && md <= 1121) return ZODIAC[7];// Scorpio
  if (md >= 1122 && md <= 1221) return ZODIAC[8];// Sagittarius
  if (md >= 1222 || md <= 119) return ZODIAC[9]; // Capricorn
  if (md >= 120 && md <= 218) return ZODIAC[10]; // Aquarius
  return ZODIAC[11]; // Pisces
}

// ─── Moon Sign (simplified ~28-day cycle approximation) ───────────────────────
// True moon sign requires an ephemeris — this gives a reasonable approximation
// based on birth date treating the moon as cycling through signs every ~2.46 days.

export function getMoonSign(birthDate: string): ZodiacSign {
  const epoch = new Date("2000-01-06"); // New moon in Capricorn reference
  const dob   = new Date(birthDate);
  const daysDiff = Math.floor((dob.getTime() - epoch.getTime()) / 86400000);
  const moonCycleDays = 29.53058;
  const signDays = moonCycleDays / 12;
  const idx = Math.floor(((daysDiff % moonCycleDays) + moonCycleDays) % moonCycleDays / signDays);
  return ZODIAC[idx % 12];
}

// ─── Rising Sign (simplified — requires birth time + location) ────────────────
// Ascendant shifts ~2h per sign. Without full ephemeris we use birth hour as proxy.

export function getRisingSign(birthTime: string): ZodiacSign | null {
  if (!birthTime) return null;
  const [h] = birthTime.split(":").map(Number);
  const idx = Math.floor(h / 2) % 12;
  return ZODIAC[idx];
}

// ─── Daily Reading ─────────────────────────────────────────────────────────────

const DAILY_THEMES = [
  ["abundance", "momentum", "clarity", "expansion", "alignment"],
  ["reflection", "strategy", "patience", "depth", "inner strength"],
  ["connection", "creativity", "boldness", "vision", "action"],
  ["renewal", "focus", "authenticity", "power", "presence"],
];

const FOUNDER_ARCHETYPES: Record<string, string[]> = {
  Fire:  ["ignite your boldest idea", "lead with courage", "take the leap you've been deferring", "trust your instincts completely"],
  Earth: ["build the foundation before the ceiling", "measure twice, execute with precision", "let your consistency be your superpower", "ground your vision in tangible action"],
  Air:   ["let ideas collide — brilliance lives in the synthesis", "your network is your net worth today", "communicate your vision with precision", "connect the dots others haven't seen yet"],
  Water: ["your intuition is data — listen deeply", "let emotion inform, not decide", "the pivot you sense is worth mapping", "depth of feeling becomes depth of product"],
};

const PLANET_INFLUENCES: Record<string, string> = {
  Sun:     "Your identity and purpose are at the forefront.",
  Moon:    "Emotional intelligence is your edge today.",
  Mercury: "Clarity in communication unlocks doors.",
  Venus:   "Relationships and aesthetics hold leverage.",
  Mars:    "Channel energy into your highest-priority action.",
  Jupiter: "Expansion is available — say yes to the right rooms.",
  Saturn:  "Discipline practiced today compounds for months.",
  Uranus:  "Disruption is a feature, not a bug. Embrace it.",
  Neptune: "Vision without deadline is still vision. Protect it.",
  Pluto:   "Transformation requires releasing what no longer serves.",
};

// Deterministic pseudo-random based on date + sign seed
function seededRand(seed: number, max: number): number {
  return Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % max | 0;
}

export interface DailyReading {
  date: string;
  sunSign: ZodiacSign;
  theme: string;
  headline: string;
  body: string;
  affirmation: string;
  founderFocus: string;
  energy: number; // 1–10
  luckyHour: string;
}

export function getDailyReading(sunSign: ZodiacSign, dateStr?: string): DailyReading {
  const today = dateStr ?? new Date().toISOString().split("T")[0];
  const dateSeed = parseInt(today.replace(/-/g, ""), 10);
  const signSeed = ZODIAC.findIndex((z) => z.id === sunSign.id);
  const seed = dateSeed + signSeed * 1000;

  const themeRow = DAILY_THEMES[seededRand(seed, DAILY_THEMES.length)];
  const theme    = themeRow[seededRand(seed + 1, themeRow.length)];

  const archetypes = FOUNDER_ARCHETYPES[sunSign.element];
  const founderFocus = archetypes[seededRand(seed + 2, archetypes.length)];

  const planetKeys = Object.keys(PLANET_INFLUENCES);
  const planet = planetKeys[seededRand(seed + 3, planetKeys.length)];
  const planetMsg = PLANET_INFLUENCES[planet];

  const energy   = (seededRand(seed + 4, 4) + 7);
  const hour     = seededRand(seed + 5, 12) + 8;
  const luckyHour = `${hour}:00${hour < 12 ? " AM" : " PM"}`;

  const headlines: Record<string, string[]> = {
    Fire:  [`${sunSign.name} energy is peaking — move on your vision`, `The fire in you is a compass today, ${sunSign.name}`, `${sunSign.name}: bold action precedes belief`],
    Earth: [`${sunSign.name}: your roots make the branches possible`, `Steady and deliberate wins the decade, ${sunSign.name}`, `${sunSign.name}: precision is your edge today`],
    Air:   [`${sunSign.name}: the conversation you need is waiting`, `Ideas want to become products today, ${sunSign.name}`, `${sunSign.name}: synthesis is your superpower`],
    Water: [`${sunSign.name}: feel it, then lead from it`, `Your depth is the differentiator today, ${sunSign.name}`, `${sunSign.name}: the pivot you sense has merit`],
  };
  const headlinePool = headlines[sunSign.element];
  const headline = headlinePool[seededRand(seed + 6, headlinePool.length)];

  const bodies: Record<string, string[]> = {
    Fire:  [
      `${planet} activates your ambition today. ${planetMsg} There is a conversation you have been orbiting — this is the day to initiate it. ${sunSign.name} thrives when momentum is self-generated. Don't wait for permission to begin.`,
      `The stars are pointing toward ${theme}. For you as a ${sunSign.name}, this means trusting the instincts that others might call reckless. They are not reckless — they are seasoned. Let the energy of today propel your most important move forward.`,
    ],
    Earth: [
      `${planet} steadies your path today. ${planetMsg} The unsexy work you do today is the moat no one else will have in three years. ${sunSign.name} builds legacy one deliberate brick at a time. This is a powerful day for deep, focused work.`,
      `A spirit of ${theme} moves through your chart. For ${sunSign.name}, progress rarely looks dramatic — it looks like another day of showing up. That consistency is your compound interest. Trust the long game you are playing.`,
    ],
    Air:  [
      `${planet} sharpens your mind today. ${planetMsg} You are made to bridge worlds, ${sunSign.name} — between idea and execution, between people who should know each other. One introduction or insight today could shift the trajectory of your quarter.`,
      `The energy of ${theme} surrounds you. Your capacity to hold multiple ideas without collapsing them into one is your gift. Today, let that gift surface in a conversation or creative session that you have been putting off.`,
    ],
    Water: [
      `${planet} deepens your intuition today. ${planetMsg} Something you have sensed but not yet said wants to be spoken — to a partner, to your team, or simply to yourself in writing. ${sunSign.name} founders who trust their emotional intelligence move differently. Move accordingly.`,
      `${theme.charAt(0).toUpperCase() + theme.slice(1)} is the frequency of your chart today. What your gut has been signaling about a decision or relationship deserves your full attention. Pause before the next meeting and listen inward for two minutes. That is your edge.`,
    ],
  };
  const bodyPool = bodies[sunSign.element];
  const body = bodyPool[seededRand(seed + 7, bodyPool.length)];

  const affirmations: string[] = [
    `I build with purpose and move with conviction.`,
    `My vision is clear, my energy is aligned, my action is intentional.`,
    `I am exactly where I need to be to become who I am meant to be.`,
    `Every decision I make today reflects my highest self.`,
    `I trust the timing of my journey and the power of consistent action.`,
    `I lead from a place of abundance, not scarcity.`,
    `The world needs what only I can build. I move accordingly.`,
  ];
  const affirmation = affirmations[seededRand(seed + 8, affirmations.length)];

  return { date: today, sunSign, theme, headline, body, affirmation, founderFocus, energy, luckyHour };
}

// ─── Parse birth date string → month, day ──────────────────────────────────────
export function parseBirthDate(dateStr: string): { month: number; day: number; year: number } | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return { month: d.getUTCMonth() + 1, day: d.getUTCDate(), year: d.getUTCFullYear() };
}
