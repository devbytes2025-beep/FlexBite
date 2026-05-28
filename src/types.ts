export interface UserProfile {
  name: string;
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: 'male' | 'female' | 'other';
  targetWeight: number; // in kg
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel: 'sedentary' | 'lightly' | 'moderately' | 'active';
  calorieTarget: number; // calculated kcal
  proteinTarget: number; // calculated g
  onboarded: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  profile: UserProfile;
}

export interface MealLog {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  loggedAt: string; // ISO string or time string
  imageUrl?: string;
}

export interface WorkoutLog {
  id: string;
  name: string;
  duration: number; // minutes
  caloriesBurned: number;
  loggedAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealLog[];
  workouts: WorkoutLog[];
  workoutMarked: boolean; // toggle to mark workout on calendar
  weightLogged?: number; // current weight logged for the day
}

export interface GEMINI_FOOD_ANALYSIS {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  analysisSummary: string;
  satisfactionTip: string; // Gen Z style tip
}
