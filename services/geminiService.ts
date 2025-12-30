
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FoodStatus, FileData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using object literal for schema as Schema type is not explicitly needed from the SDK
const analysisSchema: any = {
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
  reportFiles: FileData[], 
  foodFiles: FileData[]
): Promise<AnalysisResult> => {
  
  try {
    // Construct the parts array dynamically based on uploaded files
    const parts: any[] = [
      {
        text: `You are Nutri-Sync, an expert Clinical Nutritionist and Medical Analyst AI.
        
        GOAL: Cross-reference medical lab report(s) with food photo(s) to identify personalized dietary risks and generate a compatibility score.

        INPUT DATA:
        - The first set of images provided are the MEDICAL LAB REPORTS.
        - The second set of images provided are the NUTRIENT VISUALS (Food).

        STEP 1: ANALYZE REPORTS (Medical Data)
        - Extract critical biomarkers from ALL report images provided: HbA1c, Glucose, Cholesterol (LDL, HDL, Triglycerides), Blood Pressure, Iron, etc.
        - Identify numeric values that are High, Low, or Critical.
        - If multiple pages are provided, consolidate the findings.

        STEP 2: ANALYZE FOOD (Dietary Data)
        - Identify all distinct food items across ALL food images provided.
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
      }
    ];

    // Append Report Images
    reportFiles.forEach(file => {
      parts.push({
        inlineData: {
          data: file.base64,
          mimeType: file.mimeType
        }
      });
    });

    // Append Food Images
    foodFiles.forEach(file => {
      parts.push({
        inlineData: {
          data: file.base64,
          mimeType: file.mimeType
        }
      });
    });

    // Corrected model to 'gemini-3-flash-preview' for general text/multimodal reasoning tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: parts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.3 // Lower temperature for analytical precision
      }
    });

    // response.text is a property, correct usage
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
