# Nutri-Sync

**Nutri-Sync** is an AI-powered health application designed to interpret medical lab reports in the context of dietary choices. It helps patients understand how specific food items interact with their unique biological markers.

## Live Demo
[https://ai.studio/apps/drive/1sl1Lf2U2UIRE1p9nPMjDzUvSqmT6iORt](https://ai.studio/apps/drive/1sl1Lf2U2UIRE1p9nPMjDzUvSqmT6iORt)

## Key Features

*   **Medical Report Analysis**: Extracts key biomarkers (HbA1c, Cholesterol, etc.) from uploaded PDF or Image reports.
*   **Dietary Compatibility Check**: Analyzes food photos to identify ingredients and potential risks based on the user's specific medical profile.
*   **"Bio-Identity" Onboarding**: A simulated secure profile setup flow for personalized analysis.
*   **Safety Scoring**: Generates a 0-100 compatibility score with detailed biotech reasoning.
*   **Secure & Private**: All analysis happens within the session; user profiles are stored locally in the browser.

## Technologies Used

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **AI Model**: Google Gemini 2.5 Flash (via `@google/genai` SDK)
*   **Authentication**: Local Storage "Bio-Identity" simulation (Privacy-first design)
*   **Design**: Modern Dark Mode, Glassmorphism, Inter typography

## Disclaimer

This application is for demonstration purposes only. It is not a medical device and should not be used as a substitute for professional medical advice.