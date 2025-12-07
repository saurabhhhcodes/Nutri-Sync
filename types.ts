export enum FoodStatus {
  SAFE = 'SAFE',
  MODERATE = 'MODERATE',
  AVOID = 'AVOID'
}

export interface Biomarker {
  name: string;
  value: string;
  status: string; // e.g., "Normal", "High", "Critical"
  referenceRange?: string;
}

export interface FoodItem {
  name: string;
  status: FoodStatus;
  biotechReason: string; // specifically referencing a biomarker value
  suggestedSwap?: string;
}

export interface AnalysisResult {
  id: string;        // UUID for history
  timestamp: number; // For sorting history
  compatibilityScore: number; // 0-100 score
  biomarkers: Biomarker[];
  foodItems: FoodItem[];
  summary: string;
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}