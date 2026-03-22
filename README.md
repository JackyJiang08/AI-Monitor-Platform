# AI Monitor 🌍 ⚡️

![AI Monitor Preview](https://aimonitor-nine.vercel.app/og-image.png)

**AI Monitor** is a real-time, interactive dashboard and global map designed to track the rapidly evolving Artificial Intelligence industry. It aggregates, translates, and visualizes AI news, regulatory updates, hardware releases, and market shifts from across the globe in one unified view.

🌐 **Live Demo:** [aimonitor-nine.vercel.app](https://aimonitor-nine.vercel.app/)

## ✨ Key Features

- **Interactive Global Map:** Visualizes the geographic origin and impact level of AI events worldwide using animated markers.
- **Real-Time Automated RSS Scraping:** Continuously fetches the latest AI news from 10+ global regions (US, China, EU, Japan, etc.) in their native languages.
- **AI-Powered Analysis:** Leverages OpenAI to automatically translate foreign articles, summarize content, and dynamically score the severity and category (e.g., Hardware, Regulation, Model releases).
- **Live News Feed:** A clean, filterable data feed showing the exact time elapsed since publication.
- **Responsive UI:** Built with modern web standards, featuring a sleek, dark-mode ready interface optimized for both desktop and mobile viewing.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), React 19, TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/), Shadcn UI
- **Mapping:** [React Leaflet](https://react-leaflet.js.org/) & CartoDB tiles
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Pipeline:** Node.js, `rss-parser`, OpenAI API (`gpt-4o-mini`)

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

## 📄 License
This project is licensed under the MIT License.
