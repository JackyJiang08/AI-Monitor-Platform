const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env.local");
  process.exit(1);
}

// Claude model used for translation, structuring, and quant analysis.
// Opus 4.8 is the most capable model. To reduce cost/latency on this
// high-volume pipeline, switch to "claude-haiku-4-5".
const CLAUDE_MODEL = "claude-opus-4-8";

const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// Claude returns a text block; strip optional ```json fences before parsing.
function parseJsonResponse(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned);
}

const parser = new Parser();

// Data file path
const dataFilePath = path.join(__dirname, 'data', 'news.json');

// Load existing events to prevent duplicates
let savedEvents = [];
if (fs.existsSync(dataFilePath)) {
  try {
    savedEvents = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  } catch (e) {
    console.error("Could not parse existing news.json. Starting fresh.");
  }
}

// Define target regions with localized queries
const regions = [
  { name: 'China', gl: 'CN', hl: 'zh-CN', q: '人工智能 OR AI OR 大模型' },
  { name: 'South Korea', gl: 'KR', hl: 'ko', q: '인공지능 OR AI OR LLM' },
  { name: 'Japan', gl: 'JP', hl: 'ja', q: '人工知能 OR AI OR LLM' },
  { name: 'Australia', gl: 'AU', hl: 'en-AU', q: '"artificial intelligence" OR AI OR LLM' },
  { name: 'Canada', gl: 'CA', hl: 'en-CA', q: '"artificial intelligence" OR AI OR LLM' },
  { name: 'United Kingdom', gl: 'GB', hl: 'en-GB', q: '"artificial intelligence" OR AI OR LLM' },
  { name: 'Germany', gl: 'DE', hl: 'de', q: 'Künstliche Intelligenz OR AI OR LLM' },
  { name: 'France', gl: 'FR', hl: 'fr', q: 'intelligence artificielle OR AI OR LLM' },
  { name: 'India', gl: 'IN', hl: 'en-IN', q: '"artificial intelligence" OR AI OR LLM' },
  { name: 'United States', gl: 'US', hl: 'en-US', q: '"artificial intelligence" OR AI OR LLM' }
];

const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime();

async function fetchRSSForRegion(region) {
  // Append ' when:1d' to the query to force Google News to return only articles from the last 24 hours, ensuring we get the absolute latest news.
  const query = `${region.q} when:1d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${region.hl}&gl=${region.gl}&ceid=${region.gl}:${region.hl.split('-')[0]}`;
  
  console.log(`Fetching RSS for ${region.name}...`);
  try {
    const feed = await parser.parseURL(url);
    const recentArticles = [];
    
    for (const item of feed.items) {
      const pubDate = new Date(item.pubDate).getTime();
      // Keep historical articles up to 14 days ago to restore history
      if (pubDate >= fourteenDaysAgo) {
        recentArticles.push({
          title: item.title,
          url: item.link,
          source: item.source || feed.title,
          publishedAt: new Date(pubDate).toISOString(),
          regionName: region.name
        });
      }
    }
    
    // Get up to 15 articles per region to thoroughly restore historical data
    const topArticles = recentArticles.slice(0, 15);
    console.log(` -> Found ${topArticles.length} historical articles for ${region.name}.`);
    return topArticles;
  } catch (err) {
    console.error(` -> Error fetching RSS for ${region.name}:`, err.message);
    return [];
  }
}

const promptTemplate = `
You are an expert AI-sector quantitative analyst. I will provide you with a list of recent AI news articles from various global regions. They might be in different languages.
For each article, translate its context to English, analyze it through a markets/quant lens, and convert it into a structured JSON object.

Your output MUST be a JSON object with a single key "events" containing an array of objects matching this TypeScript interface exactly:

type Severity = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";
type Category = "Hardware" | "Software" | "Regulation" | "Research" | "Market" | "Model";
type Industry = "Hardware" | "Cloud" | "Software" | "Consumer" | "Healthcare" | "Finance" | "Automotive" | "Robotics" | "Manufacturing" | "Legal" | "Defense" | "Security" | "Media" | "Education" | "Agriculture" | "Energy" | "Research";
type MarketSentiment = "BULLISH" | "BEARISH" | "NEUTRAL";

interface MapEntity {
  id: string; // generate a unique string (e.g. "rss-[random_id]")
  entityType: "News";
  title: string; // English translation of the headline
  coordinates: [number, number]; // [longitude, latitude].
  category: Category;
  severity: Severity;
  summary: string; // 1-2 sentence English summary of what the news is about
  location: string; // e.g. "Beijing, China", "Seoul, South Korea", "Sydney, Australia", "Toronto, Canada", "San Francisco, USA"
  source: string; // The publisher name
  sourceUrl: string; // EXACT url provided in the input
  whyItMatters: string;
  industry: Industry;
  size: number; // LOW=14, MODERATE=18, ELEVATED=22, HIGH=26, CRITICAL=32
  tickers: string[]; // Public stock tickers most directly affected (e.g. ["NVDA","TSM"]). Empty array if none are clearly implicated.
  marketSentiment: MarketSentiment; // Likely directional impact on the affected names / the broader AI sector
  marketImpact: number; // Quantified market-impact magnitude from -5 (strongly bearish) to +5 (strongly bullish); 0 if neutral/unclear
  quantTakeaway: string; // One concise, market-oriented sentence: what a trader should take from this (catalyst, beneficiary, risk)
}

CRITICAL GEOGRAPHY INSTRUCTION: You MUST place the coordinates precisely at the specific CITY mentioned or most relevant to the news, NOT the geographic center of the country or state. Use exact city coordinates. 
VERY IMPORTANT: Coordinates MUST strictly be [LONGITUDE, LATITUDE]. Longitude is X (East is positive, West is negative). Latitude is Y (North is positive, South is negative). DO NOT SWAP THEM. DO NOT FORGET NEGATIVE SIGNS FOR WEST/SOUTH!
Examples: 
- Washington D.C. is [-77.0369, 38.9072] (Notice the negative longitude!)
- Seattle, Washington is [-122.3321, 47.6062]
- San Francisco is [-122.4194, 37.7749]
- Paris is [2.3522, 48.8566]
- Seoul is [126.9780, 37.5665]
- Beijing is [116.4074, 39.9042]
Never use the center of the USA [-95.7129, 37.0902]. If you don't know the exact city, guess the most likely tech hub (e.g. New York, London, Tokyo) and use its exact city coordinates.

Here are the articles:
`;

async function processBatchWithClaude(articlesBatch) {
  const articlesForLLM = articlesBatch.map((a, index) => ({
    index,
    title: a.title,
    source: a.source,
    url: a.url,
    originRegion: a.regionName
  }));

  const prompt = promptTemplate + JSON.stringify(articlesForLLM, null, 2);

  console.log(`Sending batch of ${articlesBatch.length} articles to Claude for translation, structuring & quant analysis...`);
  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 8000,
      system: "You are a quantitative AI-sector analyst that outputs valid JSON only — no prose, no markdown fences.",
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find(b => b.type === "text");
    if (!textBlock) {
      console.error("Claude returned no text content.");
      return [];
    }
    const content = parseJsonResponse(textBlock.text);

    // Explicit coordinate mapping to prevent ANY LLM hallucinations for major cities
    const HARDCODED_CITIES = {
      "san francisco": [-122.4194, 37.7749],
      "washington": [-77.0369, 38.9072],
      "new york": [-74.0060, 40.7128],
      "seattle": [-122.3321, 47.6062],
      "boston": [-71.0589, 42.3601],
      "chicago": [-87.6298, 41.8781],
      "austin": [-97.7431, 30.2672],
      "los angeles": [-118.2437, 34.0522],
      "london": [-0.1276, 51.5072],
      "paris": [2.3522, 48.8566],
      "berlin": [13.4050, 52.5200],
      "tokyo": [139.6917, 35.6895],
      "seoul": [126.9780, 37.5665],
      "beijing": [116.4074, 39.9042],
      "shanghai": [116.4074, 39.9042], // oops wait, Shanghai is 121.4737, 31.2304
      "shenzhen": [114.0579, 22.5431],
      "sydney": [151.2093, -33.8688],
      "toronto": [-79.3832, 43.6532]
    };

    HARDCODED_CITIES["shanghai"] = [121.4737, 31.2304];

    // Attach publishedAt dates
    const crypto = require('crypto');
    const finalEvents = (content.events || []).map(event => {
      const orig = articlesBatch.find(a => a.url === event.sourceUrl);
      
      // Override coordinates if it's a known city to be 100% foolproof
      if (event.location) {
        const locLower = event.location.toLowerCase();
        for (const [city, coords] of Object.entries(HARDCODED_CITIES)) {
          if (locLower.includes(city)) {
            event.coordinates = coords;
            break;
          }
        }
        
        // Final safety catch: if latitude and longitude are clearly swapped (e.g. latitude > 90)
        if (Math.abs(event.coordinates[1]) > 90) {
           const temp = event.coordinates[0];
           event.coordinates[0] = event.coordinates[1];
           event.coordinates[1] = temp;
        }
      }

      return {
        ...event,
        id: crypto.randomUUID(),
        publishedAt: orig ? orig.publishedAt : new Date().toISOString()
      };
    });

    return finalEvents;
  } catch (err) {
    console.error("Error with Claude:", err.message);
    return [];
  }
}

async function run() {
  console.log("Starting Google News RSS Scraper for Global AI News...");
  
  let allNewArticles = [];
  
  for (const region of regions) {
    const articles = await fetchRSSForRegion(region);
    
    // Deduplicate against already saved events AND already fetched articles in this run
    for (const article of articles) {
      const existsInSaved = savedEvents.some(s => s.sourceUrl === article.url);
      const existsInNew = allNewArticles.some(a => a.url === article.url);
      if (!existsInSaved && !existsInNew) {
        allNewArticles.push(article);
      }
    }
  }
  
  console.log(`\nTotal unique new articles found across all regions: ${allNewArticles.length}`);
  
  if (allNewArticles.length === 0) {
    console.log("No new articles to process. Exiting.");
    return;
  }

  // Process in batches with Claude
  const BATCH_SIZE = 10;
  let allProcessedEvents = [];
  
  for (let i = 0; i < allNewArticles.length; i += BATCH_SIZE) {
    const batch = allNewArticles.slice(i, i + BATCH_SIZE);
    const processed = await processBatchWithClaude(batch);
    allProcessedEvents.push(...processed);

    // Small delay between Claude requests to stay within rate limits
    if (i + BATCH_SIZE < allNewArticles.length) {
      console.log("Waiting 2 seconds before next Claude batch...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\nSuccessfully processed ${allProcessedEvents.length} global events through Claude.`);
  
  // Save to file
  const updatedEvents = [...allProcessedEvents, ...savedEvents];
  
  // Sort by publishedAt descending (newest first)
  updatedEvents.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  fs.writeFileSync(dataFilePath, JSON.stringify(updatedEvents, null, 2), 'utf8');
  console.log(`Saved! Total events in database now: ${updatedEvents.length}`);
  
  await generateDailySummary(updatedEvents);
}

async function generateDailySummary(latestEvents) {
  if (!latestEvents || latestEvents.length === 0) return;
  
  // Filter to only events within the last 24 hours
  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentEvents = latestEvents.filter(e => new Date(e.publishedAt).getTime() >= twentyFourHoursAgo);
  
  if (recentEvents.length === 0) {
    console.log("No events in the last 24 hours to summarize.");
    return;
  }
  
  console.log("Generating daily Quant Market Pulse using Claude for last 24h events...");

  const prompt = `You are a top-tier AI-sector quantitative analyst writing a daily markets brief. Based on the following latest AI news events from today, generate a 3-bullet "Quant Market Pulse".
Each bullet MUST be a single, snappy, market-oriented sentence of around 140 to 150 characters maximum so it fits perfectly on one line.
Frame each bullet through a trading/markets lens: name the catalyst and the likely beneficiary or at-risk company/ticker, and the directional read.
Imitate how a sharp markets desk summarizes significant tech catalysts at the top of a feed.
Do NOT use a "Lead-in: xxxx" format. Just write the single attractive sentence directly.
The summary MUST specifically include mentioned company names / tickers and the exact events (don't be too broad).
You MUST wrap the ENTIRE sentence in an HTML hyperlink to the original article. DO NOT add the word "Link" at the end.
Output MUST be a JSON object with a single key "bullets", which is an array of objects.
Each object MUST have two keys:
1. "html": The formatted HTML string (e.g. "<a href='https://example.com' target='_blank' class='hover:text-primary transition-colors underline font-medium text-foreground'>Nvidia (NVDA) lands a multi-year supply deal — bullish for TSMC and the broader AI hardware complex.</a>")
2. "publishedAt": The exact "publishedAt" value from the corresponding event you summarized.

Here are the latest events:
${JSON.stringify(recentEvents.slice(0, 20).map(e => ({ title: e.title, summary: e.summary, tickers: e.tickers, marketSentiment: e.marketSentiment, quantTakeaway: e.quantTakeaway, url: e.sourceUrl, publishedAt: e.publishedAt })), null, 2)}`;

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      system: "You are a top-tier markets analyst writing a daily quant brief. Output strictly valid JSON — no prose, no markdown fences.",
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find(b => b.type === "text");
    if (!textBlock) {
      console.error("Claude returned no text content for the summary.");
      return;
    }
    const content = parseJsonResponse(textBlock.text);

    if (content.bullets && Array.isArray(content.bullets)) {
      const summaryPath = path.join(__dirname, 'data', 'news_summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify({ bullets: content.bullets, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
      console.log("Daily summary saved to data/news_summary.json");
    }
  } catch (err) {
    console.error("Error generating daily summary:", err.message);
  }
}

run();
