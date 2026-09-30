export type Gender = 'male' | 'female';
export type StomachState = 'full' | 'medium' | 'empty';

export interface UserProfile {
  name: string;
  email?: string;
  photoURL?: string;
  gender: Gender;
  weight: number; // in kg (30 - 200)
  stomach: StomachState;
  avatar: string;
}

export interface DrinkPreset {
  id: string;
  name: string;
  icon: string;
  ml: number;
  percent: number;
  category: 'beer' | 'wine' | 'raki' | 'spirit' | 'cocktail' | 'other';
  description?: string;
}

export interface ConsumedDrink {
  id: string;
  time: number; // timestamp in ms
  name: string;
  icon: string;
  ml: number;
  percent: number;
  grams: number; // pure alcohol grams
}

export interface SessionData {
  id: string;
  startTime: number;
  drinks: ConsumedDrink[];
  waterGlasses: number;
  peak: number;
  notes?: string;
  isCompleted?: boolean;
  endTime?: number;
}

export interface ArchivedSession {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  peakBac: number;
  totalGrams: number;
  drinkCount: number;
  waterGlasses: number;
  drinks: ConsumedDrink[];
}

export interface BacStatus {
  bac: number;
  color: string;
  badgeClass: string;
  statusText: string;
  severity: 'safe' | 'low' | 'warning' | 'danger' | 'critical';
  drivingAdvice: string;
  effects: string;
}
