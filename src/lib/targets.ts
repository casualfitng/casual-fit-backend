export const genders = ["male", "female", "prefer_not_to_say"] as const;
export const experiences = ["beginner", "intermediate", "advanced"] as const;
export const locations = ["gym", "home", "both"] as const;
export const activityLevels = ["desk", "light", "moderate", "hard"] as const;
export const goals = [
  "lose_fat",
  "build_muscle",
  "gain_weight",
  "build_strength",
  "maintain_weight",
  "improve_fitness",
  "improve_body_shape",
  "improve_endurance",
] as const;
export const equipmentOptions = [
  "dumbbells",
  "resistance_bands",
  "pull_up_bar",
  "bench",
  "kettlebell",
  "no_equipment",
  "other",
] as const;
export const weekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export const cuisines = ["nigerian", "british", "international"] as const;
export const restrictions = [
  "vegetarian",
  "vegan",
  "dairy_free",
  "gluten_free",
  "nut_allergy",
  "egg_allergy",
  "fish_allergy",
  "shellfish_allergy",
  "other",
] as const;

export type Gender = (typeof genders)[number];
export type Experience = (typeof experiences)[number];
export type Location = (typeof locations)[number];
export type ActivityLevel = (typeof activityLevels)[number];
export type Goal = (typeof goals)[number];

export type TargetInput = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goals: readonly string[];
};

export type TargetEstimate = {
  calorieTarget: number;
  proteinTargetG: number;
};

const activityFactor: Record<ActivityLevel, number> = {
  desk: 1.2,
  light: 1.375,
  moderate: 1.55,
  hard: 1.725,
};

export function estimateTargets(input: TargetInput): TargetEstimate {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  const sexAdjustment =
    input.gender === "male" ? 5 : input.gender === "female" ? -161 : -78;
  const maintenance = (base + sexAdjustment) * activityFactor[input.activityLevel];
  const calories = Math.round(maintenance + goalAdjustment(input.goals));
  const protein = Math.round(input.weightKg * proteinPerKg(input.goals));
  return {
    calorieTarget: Math.max(calories, 1200),
    proteinTargetG: protein,
  };
}

function goalAdjustment(selected: readonly string[]) {
  if (selected.includes("lose_fat")) return -400;
  if (selected.includes("gain_weight") || selected.includes("build_muscle")) return 300;
  if (selected.includes("build_strength")) return 200;
  return 0;
}

function proteinPerKg(selected: readonly string[]) {
  if (selected.includes("lose_fat") || selected.includes("build_muscle")) return 2;
  if (selected.includes("build_strength") || selected.includes("gain_weight")) return 1.8;
  return 1.6;
}
