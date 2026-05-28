import { UserProfile } from "../types";

/**
 * Mifflin-St Jeor formula to compute BMR (Basal Metabolic Rate).
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female') {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    // Average baseline
    return 10 * weight + 6.25 * height - 5 * age - 78;
  }
}

/**
 * Calculates TDEE (Total Daily Energy Expenditure) based on BMR and Activity Level.
 */
export function calculateTDEE(bmr: number, activityLevel: UserProfile['activityLevel']): number {
  const multipliers = {
    sedentary: 1.2,
    lightly: 1.375,
    moderately: 1.55,
    active: 1.725,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Returns baseline calorie and protein targets according to weight, height, goal, targetWeight.
 * - Protein targets are based on TARGET BODY WEIGHT to secure optimal amino acid intake.
 */
export function calculateTargets(profile: Omit<UserProfile, 'calorieTarget' | 'proteinTarget' | 'onboarded'>): {
  calories: number;
  protein: number;
} {
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  let calories = tdee;
  if (profile.goal === 'lose') {
    calories = Math.max(1200, tdee - 500); // Floor at healthy minimum
  } else if (profile.goal === 'gain') {
    calories = tdee + 350;
  }

  // Protein calculation based on target body weight:
  // - Bulking/Gain: 2.2g per kg of target body weight to facilitate hypertrophy.
  // - Maintain: 1.8g per kg of target body weight.
  // - Lose/Shred: 2.0g per kg of target body weight to spare lean muscle under catabolism.
  let proteinFactor = 1.8;
  if (profile.goal === 'gain') {
    proteinFactor = 2.2;
  } else if (profile.goal === 'lose') {
    proteinFactor = 2.0;
  }

  const protein = Math.round(profile.targetWeight * proteinFactor);

  return {
    calories: Math.round(calories),
    protein: Math.max(40, protein), // Min floor for safety
  };
}
