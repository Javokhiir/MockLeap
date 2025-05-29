# RealMockTest AI Assistant

An AI-powered IELTS test preparation platform with real-time feedback and analysis.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Development Mode

If you don't have Supabase credentials, the application will run in development mode with a mock Supabase client. This allows you to test the UI and functionality without setting up a Supabase project.

Note: In development mode, data will not persist between sessions.

## Features

- Complete IELTS test simulation (Listening, Reading, Writing, Speaking)
- AI-powered feedback and analysis
- Progress tracking and statistics
- Multilingual support (English, Russian, Uzbek)
- Certificate generation
- Leaderboard and gamification

## Tech Stack

- React + TypeScript
- TailwindCSS
- HeroUI Components
- Supabase (Auth, Database, Storage)
- OpenAI API
- i18next for localization
- jsPDF for certificate generation
# MockLeap
