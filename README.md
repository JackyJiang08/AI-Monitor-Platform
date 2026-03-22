# AI Monitor Platform 🌍 ⚡️

**AI Monitor Platform** is a comprehensive, real-time, interactive dashboard and global map designed to track the rapidly evolving Artificial Intelligence industry. It aggregates, translates, and visualizes AI news, regulatory updates, hardware releases, and market shifts from across the globe in one unified view.

🌐 **Live Demo:** [aimonitor-nine.vercel.app](https://aimonitor-nine.vercel.app/)

## ✨ Key Features & Modules

The platform is divided into several specialized modules to provide a 360-degree view of the AI landscape:

- **🌍 Overview (Interactive Map):** This core module visualizes the geographic origin and global impact level of AI events using animated, color-coded markers. It provides an immediate bird's-eye view of where the most critical technological breakthroughs and regulatory developments are happening in real-time.
- **📰 News Feed:** A clean, continuously updated data stream showing the latest AI developments across the globe. Users can dynamically filter this feed by specific industries (like Hardware or Software), severity levels, and specific timeframes to easily cut through the noise and find exactly what matters to them.
- **🧠 Models:** This dedicated section tracks the rapid pace of both open-source and proprietary foundation models. It provides comprehensive details on the latest model releases, parameter sizes, architecture updates, and performance benchmarks to keep users informed on the bleeding edge of AI capabilities.
- **📈 Market:** Designed to monitor broader market trends, this module tracks AI company stock performances and macroeconomic shifts driven by AI advancements. It offers a comprehensive look at how emerging AI technologies are actively disrupting and shaping the global financial landscape.
- **💹 Trading:** A highly specialized interface built for quantitative analysis and automated trading benchmarks. This tab focuses on interpreting AI-driven trading signals and transforming raw market sentiment into actionable, quantitative insights to help power automated, algorithmic trading strategies.
- **📚 Sources:** A transparent and robust management view displaying the diverse array of global data sources that feed the platform's intelligence. It tracks everything from major financial publications to highly specialized, localized AI research outlets from around the world.
- **🔔 Notifications:** A customizable, proactive alert system designed to ensure users never miss a critical update. Users can configure this module to push immediate notifications regarding severe AI events, sudden regulatory changes, or major hardware announcements as soon as they happen.

## 🤖 AI Analysis by LLM & Data Pipeline

At the core of the platform is a sophisticated, automated data engine powered by Large Language Models:

- **Real-Time Automated Scraping:** Continuously fetches the latest AI news from 10+ global regions (US, China, EU, Japan, Korea, etc.) directly via native-language RSS feeds.
- **LLM-Powered Processing:** Leverages OpenAI to ingest raw, multi-lingual data and automatically:
  - **Translate** foreign articles into fluent English.
  - **Summarize** lengthy news into concise, actionable insights.
  - **Dynamically Score** the severity (Low to Critical) based on global impact.
  - **Categorize** the news (e.g., Hardware, Regulation, Model releases) and pinpoint the exact geographic coordinates for the map.
- **Corporate Trend Analysis:** The LLM continuously analyzes the overall momentum and sentiment surrounding individual AI-related companies, distilling massive amounts of news into clear, overarching trend reports.
- **AI-Driven Trading Logic:** The system uses LLMs to interpret market shifts and news sentiment, transforming qualitative information into quantitative insights to help power automated trading strategies and benchmarks.

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
