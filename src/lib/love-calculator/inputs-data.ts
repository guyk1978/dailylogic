import type { LoveInputDef, LoveMoodDef } from "./types";

export const LOVE_INPUT_CATEGORY_ORDER = [
  "food",
  "home",
  "habits",
  "stuff",
  "moments",
  "outdoors",
] as const;

export const LOVE_INPUTS: LoveInputDef[] = [
  // —— food ——
  {
    id: "morning-coffee",
    category: "food",
    traits: { energy: 72, chaos: 18, comfort: 88, social: 22, indulgence: 45 },
    tags: ["ritual", "caffeine", "morning", "quiet"],
  },
  {
    id: "chocolate-bailout",
    category: "food",
    traits: { energy: 40, chaos: 25, comfort: 92, social: 10, indulgence: 95 },
    tags: ["comfort", "sweet", "self-care", "indulgence"],
  },
  {
    id: "leftover-victory",
    category: "food",
    traits: { energy: 35, chaos: 40, comfort: 80, social: 5, indulgence: 55 },
    tags: ["practical", "comfort", "solo"],
  },
  {
    id: "fresh-bakery",
    category: "food",
    traits: { energy: 55, chaos: 20, comfort: 85, social: 35, indulgence: 70 },
    tags: ["sensory", "morning", "treat"],
  },
  {
    id: "soup-weather",
    category: "food",
    traits: { energy: 25, chaos: 10, comfort: 95, social: 40, indulgence: 40 },
    tags: ["comfort", "warm", "slow"],
  },
  {
    id: "midnight-snack",
    category: "food",
    traits: { energy: 30, chaos: 65, comfort: 75, social: 5, indulgence: 88 },
    tags: ["chaos", "night", "indulgence", "secret"],
  },
  {
    id: "perfect-toast",
    category: "food",
    traits: { energy: 45, chaos: 15, comfort: 82, social: 15, indulgence: 35 },
    tags: ["ritual", "precision", "small-win"],
  },
  {
    id: "ice-cold-water",
    category: "food",
    traits: { energy: 60, chaos: 8, comfort: 70, social: 5, indulgence: 15 },
    tags: ["reset", "simple", "body"],
  },
  {
    id: "delivery-arrival",
    category: "food",
    traits: { energy: 50, chaos: 45, comfort: 78, social: 20, indulgence: 80 },
    tags: ["convenience", "treat", "relief"],
  },
  {
    id: "shared-plate",
    category: "food",
    traits: { energy: 55, chaos: 30, comfort: 70, social: 90, indulgence: 50 },
    tags: ["social", "connection", "table"],
  },
  {
    id: "first-sip-tea",
    category: "food",
    traits: { energy: 35, chaos: 5, comfort: 90, social: 15, indulgence: 30 },
    tags: ["ritual", "calm", "quiet"],
  },
  {
    id: "crispy-chips",
    category: "food",
    traits: { energy: 48, chaos: 55, comfort: 72, social: 25, indulgence: 85 },
    tags: ["crunch", "indulgence", "mindless"],
  },

  // —— home ——
  {
    id: "kids-asleep-silence",
    category: "home",
    traits: { energy: 20, chaos: 5, comfort: 98, social: 0, indulgence: 40 },
    tags: ["silence", "parenting", "relief", "night"],
  },
  {
    id: "clean-desk",
    category: "home",
    traits: { energy: 55, chaos: 8, comfort: 75, social: 10, indulgence: 20 },
    tags: ["order", "focus", "reset"],
  },
  {
    id: "fresh-sheets",
    category: "home",
    traits: { energy: 30, chaos: 5, comfort: 96, social: 15, indulgence: 45 },
    tags: ["sensory", "rest", "luxury-small"],
  },
  {
    id: "open-window-breeze",
    category: "home",
    traits: { energy: 50, chaos: 15, comfort: 80, social: 10, indulgence: 20 },
    tags: ["sensory", "air", "reset"],
  },
  {
    id: "laundry-done",
    category: "home",
    traits: { energy: 40, chaos: 12, comfort: 70, social: 5, indulgence: 15 },
    tags: ["order", "adulting", "small-win"],
  },
  {
    id: "sofa-collapse",
    category: "home",
    traits: { energy: 8, chaos: 20, comfort: 95, social: 25, indulgence: 60 },
    tags: ["rest", "comfort", "surrender"],
  },
  {
    id: "candle-evening",
    category: "home",
    traits: { energy: 25, chaos: 10, comfort: 88, social: 35, indulgence: 50 },
    tags: ["atmosphere", "slow", "evening"],
  },
  {
    id: "inbox-zero-ish",
    category: "home",
    traits: { energy: 65, chaos: 15, comfort: 60, social: 20, indulgence: 10 },
    tags: ["order", "focus", "relief"],
  },
  {
    id: "hot-shower-steam",
    category: "home",
    traits: { energy: 45, chaos: 10, comfort: 93, social: 0, indulgence: 55 },
    tags: ["reset", "body", "privacy"],
  },
  {
    id: "plant-new-leaf",
    category: "home",
    traits: { energy: 40, chaos: 8, comfort: 72, social: 5, indulgence: 25 },
    tags: ["growth", "quiet", "care"],
  },

  // —— habits ——
  {
    id: "cancel-last-minute",
    category: "habits",
    traits: { energy: 25, chaos: 70, comfort: 85, social: 5, indulgence: 75 },
    tags: ["chaos", "boundaries", "relief", "introvert"],
  },
  {
    id: "reply-later-forever",
    category: "habits",
    traits: { energy: 20, chaos: 60, comfort: 70, social: 15, indulgence: 55 },
    tags: ["avoidance", "chaos", "digital"],
  },
  {
    id: "overthink-playlist",
    category: "habits",
    traits: { energy: 35, chaos: 50, comfort: 65, social: 10, indulgence: 40 },
    tags: ["rumination", "music", "solo"],
  },
  {
    id: "fake-busy",
    category: "habits",
    traits: { energy: 45, chaos: 55, comfort: 50, social: 40, indulgence: 35 },
    tags: ["performance", "work", "chaos"],
  },
  {
    id: "scroll-in-bed",
    category: "habits",
    traits: { energy: 15, chaos: 45, comfort: 70, social: 30, indulgence: 80 },
    tags: ["digital", "night", "indulgence"],
  },
  {
    id: "reorganize-apps",
    category: "habits",
    traits: { energy: 50, chaos: 20, comfort: 60, social: 5, indulgence: 25 },
    tags: ["order", "procrastination", "digital"],
  },
  {
    id: "sneak-nap",
    category: "habits",
    traits: { energy: 10, chaos: 35, comfort: 90, social: 0, indulgence: 70 },
    tags: ["rest", "secret", "recovery"],
  },
  {
    id: "check-fridge-again",
    category: "habits",
    traits: { energy: 25, chaos: 40, comfort: 55, social: 0, indulgence: 50 },
    tags: ["ritual", "hope", "food-adjacent"],
  },
  {
    id: "arrive-early-sit",
    category: "habits",
    traits: { energy: 40, chaos: 15, comfort: 65, social: 20, indulgence: 20 },
    tags: ["control", "quiet", "buffer"],
  },
  {
    id: "narrate-to-self",
    category: "habits",
    traits: { energy: 45, chaos: 45, comfort: 60, social: 5, indulgence: 30 },
    tags: ["quirky", "solo", "mind"],
  },

  // —— stuff ——
  {
    id: "new-old-book-smell",
    category: "stuff",
    traits: { energy: 40, chaos: 12, comfort: 85, social: 10, indulgence: 45 },
    tags: ["sensory", "books", "nostalgia"],
  },
  {
    id: "favorite-mug",
    category: "stuff",
    traits: { energy: 35, chaos: 8, comfort: 90, social: 15, indulgence: 35 },
    tags: ["ritual", "object-love", "morning"],
  },
  {
    id: "noise-canceling",
    category: "stuff",
    traits: { energy: 50, chaos: 10, comfort: 80, social: 5, indulgence: 55 },
    tags: ["boundaries", "focus", "tech"],
  },
  {
    id: "cozy-socks",
    category: "stuff",
    traits: { energy: 20, chaos: 5, comfort: 94, social: 5, indulgence: 40 },
    tags: ["comfort", "body", "small"],
  },
  {
    id: "good-pen",
    category: "stuff",
    traits: { energy: 45, chaos: 10, comfort: 70, social: 10, indulgence: 30 },
    tags: ["precision", "object-love", "focus"],
  },
  {
    id: "phone-at-100",
    category: "stuff",
    traits: { energy: 55, chaos: 15, comfort: 75, social: 40, indulgence: 25 },
    tags: ["relief", "tech", "control"],
  },
  {
    id: "new-notebook",
    category: "stuff",
    traits: { energy: 60, chaos: 15, comfort: 72, social: 10, indulgence: 50 },
    tags: ["hope", "fresh-start", "papers"],
  },
  {
    id: "perfect-playlist",
    category: "stuff",
    traits: { energy: 70, chaos: 25, comfort: 80, social: 20, indulgence: 45 },
    tags: ["music", "mood", "flow"],
  },

  // —— moments ——
  {
    id: "perfect-parking",
    category: "moments",
    traits: { energy: 75, chaos: 30, comfort: 70, social: 15, indulgence: 20 },
    tags: ["luck", "small-win", "city", "relief"],
  },
  {
    id: "green-lights-streak",
    category: "moments",
    traits: { energy: 80, chaos: 25, comfort: 65, social: 10, indulgence: 15 },
    tags: ["luck", "flow", "city"],
  },
  {
    id: "unexpected-compliment",
    category: "moments",
    traits: { energy: 70, chaos: 35, comfort: 75, social: 85, indulgence: 30 },
    tags: ["social", "boost", "connection"],
  },
  {
    id: "rain-on-roof",
    category: "moments",
    traits: { energy: 25, chaos: 20, comfort: 92, social: 20, indulgence: 35 },
    tags: ["sensory", "weather", "cozy"],
  },
  {
    id: "found-money",
    category: "moments",
    traits: { energy: 85, chaos: 50, comfort: 60, social: 25, indulgence: 55 },
    tags: ["luck", "surprise", "boost"],
  },
  {
    id: "meeting-canceled",
    category: "moments",
    traits: { energy: 55, chaos: 40, comfort: 88, social: 10, indulgence: 50 },
    tags: ["relief", "time-gift", "work"],
  },
  {
    id: "eye-contact-stranger-smile",
    category: "moments",
    traits: { energy: 60, chaos: 30, comfort: 55, social: 75, indulgence: 20 },
    tags: ["social", "human", "soft"],
  },
  {
    id: "song-at-right-time",
    category: "moments",
    traits: { energy: 65, chaos: 25, comfort: 80, social: 15, indulgence: 40 },
    tags: ["music", "sync", "emotion"],
  },
  {
    id: "almost-missed-bus-made-it",
    category: "moments",
    traits: { energy: 90, chaos: 75, comfort: 50, social: 30, indulgence: 25 },
    tags: ["adrenaline", "luck", "city"],
  },
  {
    id: "sunset-glance",
    category: "moments",
    traits: { energy: 40, chaos: 10, comfort: 85, social: 25, indulgence: 30 },
    tags: ["beauty", "pause", "nature"],
  },

  // —— outdoors ——
  {
    id: "empty-park-bench",
    category: "outdoors",
    traits: { energy: 35, chaos: 10, comfort: 80, social: 5, indulgence: 25 },
    tags: ["quiet", "nature", "pause"],
  },
  {
    id: "morning-walk-alone",
    category: "outdoors",
    traits: { energy: 65, chaos: 15, comfort: 75, social: 10, indulgence: 20 },
    tags: ["body", "reset", "morning"],
  },
  {
    id: "shade-on-hot-day",
    category: "outdoors",
    traits: { energy: 40, chaos: 20, comfort: 85, social: 15, indulgence: 30 },
    tags: ["relief", "body", "weather"],
  },
  {
    id: "bike-no-traffic",
    category: "outdoors",
    traits: { energy: 85, chaos: 20, comfort: 60, social: 15, indulgence: 25 },
    tags: ["flow", "freedom", "body"],
  },
  {
    id: "market-wander",
    category: "outdoors",
    traits: { energy: 55, chaos: 45, comfort: 65, social: 60, indulgence: 55 },
    tags: ["sensory", "social", "browse"],
  },
  {
    id: "sea-smell",
    category: "outdoors",
    traits: { energy: 50, chaos: 15, comfort: 88, social: 20, indulgence: 35 },
    tags: ["sensory", "nature", "reset"],
  },
];

export const LOVE_MOODS: LoveMoodDef[] = [
  {
    id: "soft-optimistic",
    scoreBias: 8,
    traits: { energy: 60, comfort: 70, social: 55 },
    tags: ["up", "gentle", "hope"],
  },
  {
    id: "tired-aristocrat",
    scoreBias: 3,
    traits: { energy: 20, comfort: 80, indulgence: 70 },
    tags: ["low-energy", "elegant", "rest"],
  },
  {
    id: "chaotic-productive",
    scoreBias: 5,
    traits: { energy: 75, chaos: 80, comfort: 40 },
    tags: ["chaos", "work", "wired"],
  },
  {
    id: "quietly-melancholy",
    scoreBias: -2,
    traits: { energy: 25, comfort: 60, social: 15 },
    tags: ["soft-sad", "reflective", "slow"],
  },
  {
    id: "social-battery-full",
    scoreBias: 7,
    traits: { energy: 70, social: 90, comfort: 55 },
    tags: ["social", "outgoing", "bright"],
  },
  {
    id: "need-a-cave",
    scoreBias: 1,
    traits: { energy: 15, social: 5, comfort: 85, chaos: 20 },
    tags: ["introvert", "hide", "recover"],
  },
  {
    id: "petty-victorious",
    scoreBias: 6,
    traits: { energy: 65, chaos: 40, indulgence: 55 },
    tags: ["smug", "win", "spice"],
  },
  {
    id: "overwhelmed-but-cute",
    scoreBias: -1,
    traits: { energy: 35, chaos: 70, comfort: 45 },
    tags: ["overwhelm", "soft", "messy"],
  },
  {
    id: "focus-mode",
    scoreBias: 4,
    traits: { energy: 70, chaos: 10, social: 20, comfort: 50 },
    tags: ["focus", "sharp", "work"],
  },
  {
    id: "weekend-brain",
    scoreBias: 9,
    traits: { energy: 45, comfort: 85, indulgence: 75, chaos: 35 },
    tags: ["leisure", "loose", "treat"],
  },
  {
    id: "spicy-impatient",
    scoreBias: 0,
    traits: { energy: 80, chaos: 65, comfort: 30 },
    tags: ["impatient", "hot", "edge"],
  },
  {
    id: "grateful-glitch",
    scoreBias: 10,
    traits: { energy: 55, comfort: 75, social: 60 },
    tags: ["gratitude", "soft", "up"],
  },
];

export function getLoveInput(id: string): LoveInputDef | undefined {
  return LOVE_INPUTS.find((item) => item.id === id);
}

export function getLoveMood(id: string): LoveMoodDef | undefined {
  return LOVE_MOODS.find((item) => item.id === id);
}

export function getInputsByCategory(category: LoveInputDef["category"]) {
  return LOVE_INPUTS.filter((item) => item.category === category);
}
