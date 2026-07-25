export type Meal = {
  id: string;
  user_id: string;
  raw_text: string;
  health_score: number;
  carbs: number;
  protein: number;
  fats: number;
  fiber: number;
  sugar: number;
  vitamins: number;
  flags: string[];
  summary: string | null;
  logged_at: string;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  overall_reset_at: string;
  created_at: string;
};

export type CategoryKey =
  | "carbs"
  | "protein"
  | "fats"
  | "fiber"
  | "sugar"
  | "vitamins";

export type CategoryScores = Record<CategoryKey, number>;

export type MealAnalysis = {
  healthScore: number;
  carbs: number;
  protein: number;
  fats: number;
  fiber: number;
  sugar: number;
  vitamins: number;
  flags: string[];
  summary: string;
};

export type Aggregates = {
  today: number | null;
  weekly: number | null;
  overall: number | null;
  categories: CategoryScores | null;
  tips: string[];
};
