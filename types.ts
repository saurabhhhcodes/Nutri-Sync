
export enum FoodStatus {
  SAFE = 'SAFE',
  MODERATE = 'MODERATE',
  AVOID = 'AVOID'
}

export type SubscriptionTier = 'FREE' | 'PRO';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  tier: SubscriptionTier;
  credits: number;
  lastSyncedAt?: number;
}

export interface Biomarker {
  name: string;
  value: string;
  status: string; 
  referenceRange?: string;
}

export interface FoodItem {
  name: string;
  status: FoodStatus;
  biotechReason: string; 
  suggestedSwap?: string;
}

export interface AnalysisResult {
  id: string;
  userId: string;
  timestamp: number; 
  compatibilityScore: number; 
  biomarkers: Biomarker[];
  foodItems: FoodItem[];
  summary: string;
  isSynced?: boolean;
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}
