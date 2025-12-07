import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, FoodStatus } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    compatibilityScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating how safe this meal is for the patient. 0 = Dangerous/Avoid, 100 = Perfectly Safe/Beneficial."
    },
    biomarkers: {
      type: Type.ARRAY,
      description: "List of key biomarkers extracted from the medical report.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the biomarker (e.g., HbA1c, LDL)" },
          value: { type: Type.STRING, description: "The specific value extracted (e.g., 8.5%, 160 mg/dL)" },
          status: { type: Type.STRING, description: "Clinical status (Normal, High, Low, Critical)" },
        },
        required: ["name", "value", "status"]
      }
    },
    foodItems: {
      type: Type.ARRAY,
      description: "List of identified food items and their compatibility analysis.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the food item detected" },
          status: { 
            type: Type.STRING, 
            enum: ["SAFE", "MODERATE", "AVOID"],
            description: "Suitability based on medical report"
          },
          biotechReason: { 
            type: Type.STRING, 
            description: "Detailed reason referencing specific values from the report. E.g., 'Avoid because Saturated Fat exacerbates your LDL of 160 mg/dL'." 
          },
          suggestedSwap: { type: Type.STRING, description: "A healthier alternative" }
        },
        required: ["name", "status", "biotechReason"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "A brief, 2-sentence executive summary of the overall meal compatibility."
    }
  },
  required: ["compatibilityScore", "biomarkers", "foodItems", "summary"]
};

export const analyzeHealthAndFood = async (
  reportBase64: string, 
  reportMimeType: string,
  foodBase64: string,
  foodMimeType: string
): Promise<AnalysisResult> => {
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            text: `You are Nutri-Sync, an expert Clinical Nutritionist and Medical Analyst AI.
            
            GOAL: Cross-reference a medical lab report with a food photo to identify personalized dietary risks and generate a compatibility score.

            STEP 1: ANALYZE REPORT (First Image)
            - Extract critical biomarkers: HbA1c, Glucose, Cholesterol (LDL, HDL, Triglycerides), Blood Pressure, Iron, etc.
            - Identify numeric values that are High, Low, or Critical.

            STEP 2: ANALYZE FOOD (Second Image)
            - Identify all distinct food items.
            - DETECTION NUANCE: Be skeptical of "healthy-looking" foods if they contradict the user's pathology. 
            - Example: A fruit salad looks healthy, but if the patient has High HbA1c/Diabetes, high-glycemic fruits (Mangoes, Grapes, Bananas) are RISKY.

            STEP 3: COMPATIBILITY CHECK & SCORING (The Logic Core)
            - For each food item, classify as: SAFE (Green), MODERATE (Yellow), or AVOID (Red).
            - STRICT RULE: You MUST explicitly quote the user's specific biomarker value in the 'biotechReason'.
            - Calculate a 'compatibilityScore' (0-100). 
              - 90-100: Everything is safe.
              - 70-89: Minor issues or moderation needed.
              - 50-69: Some items should be avoided.
              - <50: Dangerous combination (e.g. Sugar + Diabetes, Salt + Hypertension).

            EXAMPLES OF DESIRED OUTPUT:
            - BAD: "Avoid mango because it is high in sugar."
            - GOOD: "Avoid: High glycemic index risks spiking your Glucose (currently 200 mg/dL) and exacerbating your HbA1c (8.5%)."
            - BAD: "Steak is bad for your heart."
            - GOOD: "Avoid: High Saturated Fat content is dangerous for your elevated LDL Cholesterol of 160 mg/dL."

            STEP 4: SUGGEST SWAPS
            - For every AVOID or MODERATE item, provide a realistic, healthier alternative (e.g., "Berries" instead of "Mango", "Grilled Chicken" instead of "Steak").
            `
          },
          {
            inlineData: {
              data: reportBase64,
              mimeType: reportMimeType
            }
          },
          {
            inlineData: {
              data: foodBase64,
              mimeType: foodMimeType
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.3 // Lower temperature for analytical precision
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    
    // Enrich with ID and Timestamp on client-side for history management
    return {
      ...parsed,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    } as AnalysisResult;

  } catch (error) {
    console.error("Analysis Failed:", error);
    throw error;
  }
};