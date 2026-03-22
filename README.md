# AI Monitor Platform 🌍 ⚡️

**AI Monitor Platform** is a comprehensive, real-time, interactive dashboard and global map designed to track the rapidly evolving Artificial Intelligence industry. It aggregates, translates, and visualizes AI news, regulatory updates, hardware releases, and market shifts from across the globe in one unified view.

🌐 **Live Demo:** [aimonitor-nine.vercel.app](https://aimonitor-nine.vercel.app/)

## ✨ Key Features & Modules

The platform is divided into several specialized modules to provide a 360-degree view of the AI landscape:

- **🌍 Overview (Interactive Map):** Visualizes the geographic origin and impact level of AI events worldwide using animated markers. Get a bird's-eye view of where the most critical AI developments are happening in real-time.
- **📰 News Feed:** A clean, filterable data stream showing the latest AI developments. Filter by industry, severity, and timeframe to cut through the noise and find exactly what matters.
- **🧠 Models:** Track the latest AI model releases, performance benchmarks, and capabilities. Keep up with the rapid pace of open-source and proprietary foundation models.
- **📈 Market:** Monitor market trends, AI company stock performances, and financial shifts driven by AI advancements.
- **💹 Trading:** Dedicated interface for AI-driven trading signals, quantitative analysis, and automated trading benchmarks.
- **📚 Sources:** Manage and view the diverse array of global data sources feeding the platform, from local news outlets to specialized AI research publications.
- **🔔 Notifications:** Customizable alert system designed to notify you immediately of critical AI events, regulatory changes, or major hardware announcements.

## 🤖 AI Analysis by LLM & Data Pipeline

At the core of the platform is a sophisticated, automated data engine powered by Large Language Models:

- **Real-Time Automated Scraping:** Continuously fetches the latest AI news from 10+ global regions (US, China, EU, Japan, Korea, etc.) directly via native-language RSS feeds.
- **LLM-Powered Processing:** Leverages OpenAI to ingest raw, multi-lingual data and automatically:
  - **Translate** foreign articles into fluent English.
  - **Summarize** lengthy news into concise, actionable insights.
  - **Dynamically Score** the severity (Low to Critical) based on global impact.
  - **Categorize** the news (e.g., Hardware, Regulation, Model releases) and pinpoint the exact geographic coordinates for the map.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), React 19, TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), Shadcn UI
- **Mapping:** [React Leaflet](https://react-leaflet.js.org/) & CartoDB tiles
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Pipeline:** Node.js, `rss-parser`, OpenAI API

## 🚀 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/JackyJiang08/AI-Monitor.git
cd AI-Monitor/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the `frontend` directory and add your OpenAI API key (required for the automated news fetcher):
```env
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 5. Start the Live News Fetcher (Optional)
To run the background worker that automatically scrapes and analyzes global news every hour:
```bash
node start_live_news.js
```
