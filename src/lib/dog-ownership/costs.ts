import type {
  AlonePattern,
  DogAge,
  DogCostBreakdown,
  DogSetup,
  DogSize,
  GroomingNeed,
  TrainingPlan,
} from "./types";

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

const FOOD: Record<DogSize, number> = {
  small: 180,
  medium: 290,
  large: 450,
};

const TREATS: Record<DogSize, number> = {
  small: 40,
  medium: 60,
  large: 85,
};

const FLEA: Record<DogSize, number> = {
  small: 45,
  medium: 55,
  large: 75,
};

const EMERGENCY: Record<DogSize, number> = {
  small: 80,
  medium: 110,
  large: 150,
};

const WALKER: Record<AlonePattern, number> = {
  homeMostly: 0,
  mixed: 120,
  aloneOften: 320,
};

const ANNUAL_VACCINE: Record<DogAge, number> = {
  puppy: 650,
  adult: 320,
  senior: 380,
};

const ANNUAL_VET: Record<DogAge, Record<DogSize, number>> = {
  puppy: { small: 480, medium: 560, large: 680 },
  adult: { small: 280, medium: 340, large: 420 },
  senior: { small: 520, medium: 640, large: 780 },
};

const GROOMING_YEAR: Record<GroomingNeed, Record<DogSize, number>> = {
  low: { small: 0, medium: 0, large: 0 },
  regular: { small: 720, medium: 960, large: 1200 },
};

const CONSUMABLES: Record<DogSize, number> = {
  small: 180,
  medium: 240,
  large: 300,
};

const GEAR: Record<DogSize, number> = {
  small: 550,
  medium: 750,
  large: 1100,
};

const SPAY: Record<DogSize, number> = {
  small: 900,
  medium: 1300,
  large: 1800,
};

const CHIP = 250;

const TRAINING_MONTHLY: Record<TrainingPlan, number> = {
  none: 0,
  planned: 180,
  active: 280,
};

const TRAINING_ONETIME: Record<TrainingPlan, number> = {
  none: 0,
  planned: 400,
  active: 200,
};

/** Age soft multipliers on food/medical feel. */
function ageFoodFactor(age: DogAge): number {
  if (age === "puppy") return 1.08;
  if (age === "senior") return 1.05;
  return 1;
}

/**
 * Build a realistic cost breakdown from setup.
 * Amounts are educational mid-market estimates in local currency units.
 */
export function calculateDogCosts(setup: DogSetup): DogCostBreakdown {
  const { size, age, alone, grooming, training } = setup;
  const food = round5(FOOD[size] * ageFoodFactor(age));
  const treats = TREATS[size];
  const flea = FLEA[size];
  const emergency = EMERGENCY[size];
  const walker = WALKER[alone];
  const trainMonth = TRAINING_MONTHLY[training];

  const monthly = [
    { id: "food", amount: food },
    { id: "treats", amount: treats },
    { id: "flea", amount: flea },
    { id: "emergency", amount: emergency },
    ...(walker > 0 ? [{ id: "walker", amount: walker }] : []),
    ...(trainMonth > 0 ? [{ id: "training", amount: trainMonth }] : []),
  ];

  const vaccine = ANNUAL_VACCINE[age];
  const vet = ANNUAL_VET[age][size];
  const groom = GROOMING_YEAR[grooming][size];
  const consumables = CONSUMABLES[size];

  const annual = [
    { id: "vaccines", amount: vaccine },
    { id: "vetCheck", amount: vet },
    ...(groom > 0 ? [{ id: "grooming", amount: groom }] : []),
    { id: "consumables", amount: consumables },
  ];

  const trainOnce = TRAINING_ONETIME[training];
  const oneTime = [
    { id: "gear", amount: GEAR[size] },
    { id: "spayNeuter", amount: SPAY[size] },
    { id: "chip", amount: CHIP },
    ...(trainOnce > 0 ? [{ id: "trainingStart", amount: trainOnce }] : []),
  ];

  // Puppies: first-year medical bump as soft one-time add-on
  if (age === "puppy") {
    oneTime.push({ id: "puppyYear", amount: round5(vet * 0.45 + 200) });
  }

  const monthlyTotal = monthly.reduce((s, l) => s + l.amount, 0);
  const annualTotal = annual.reduce((s, l) => s + l.amount, 0);
  const oneTimeTotal = oneTime.reduce((s, l) => s + l.amount, 0);
  const yearlyForecast = monthlyTotal * 12 + annualTotal;
  // Recommended monthly = run-rate + annual amortized + small cushion
  const recommendedMonthly = round5(monthlyTotal + annualTotal / 12 + 40);

  return {
    monthly,
    annual,
    oneTime,
    monthlyTotal,
    annualTotal,
    yearlyForecast,
    oneTimeTotal,
    recommendedMonthly,
  };
}
