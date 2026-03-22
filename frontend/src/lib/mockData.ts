export type Severity = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "CRITICAL";
export type Category = "Hardware" | "Software" | "Regulation" | "Research" | "Market" | "Model";
export type Industry = 
  | "Hardware" 
  | "Cloud" 
  | "Software" 
  | "Consumer"
  | "Healthcare" 
  | "Finance" 
  | "Automotive" 
  | "Robotics"
  | "Manufacturing"
  | "Legal" 
  | "Defense"
  | "Security"
  | "Media"
  | "Education"
  | "Agriculture"
  | "Energy"
  | "Research";

export type EntityType = "News" | "Model" | "Market" | "Company";

export interface MapEntity {
  id: string;
  entityType: EntityType;
  title: string;
  coordinates: [number, number]; // [longitude, latitude]
  category: Category;
  severity: Severity;
  summary: string;
  location: string;
  source: string;
  sourceUrl: string;
  whyItMatters: string;
  industry: Industry;
  timeAgo: string;
  publishedAt?: string; // ISO date string for dynamic time calculation
  size?: number; // Size weight for map clustering representation
}

// Keep the old export for backward compatibility in the rest of the app, just an alias
export type AINewsEvent = MapEntity;

export const mockAiNewsEvents: MapEntity[] = [
  // --- NEWS EVENTS ---
  {
    id: "1",
    entityType: "News",
    title: "NVIDIA Unveils Next-Gen AI Chip 'Blackwell'",
    coordinates: [-121.9692, 37.3688], // Santa Clara, CA
    category: "Hardware",
    severity: "CRITICAL",
    summary: "NVIDIA announces a massive leap in processing power with its new architecture, aiming to lower inference costs significantly.",
    location: "Santa Clara, USA",
    source: "Bloomberg",
    sourceUrl: "https://bloomberg.com",
    whyItMatters: "This new architecture will likely set the benchmark for the next 2-3 years in AI training and inference, forcing competitors to accelerate their own roadmaps.",
    industry: "Hardware",
    timeAgo: "10 mins ago",
    size: 24
  },
  {
    id: "2",
    entityType: "News",
    title: "EU Passes Historic AI Act",
    coordinates: [4.3517, 50.8503], // Brussels, Belgium
    category: "Regulation",
    severity: "HIGH",
    summary: "The European Parliament adopts sweeping rules for AI systems, introducing strict compliance requirements for high-risk applications.",
    location: "Brussels, EU",
    source: "Reuters",
    sourceUrl: "https://reuters.com",
    whyItMatters: "Compliance costs will soar for EU-based AI startups, and international companies may delay releasing their latest models in the European market.",
    industry: "Legal",
    timeAgo: "45 mins ago",
    size: 16
  },
  {
    id: "3",
    entityType: "News",
    title: "OpenAI Releases GPT-5 Beta",
    coordinates: [-122.4194, 37.7749], // San Francisco, CA
    category: "Software",
    severity: "CRITICAL",
    summary: "The long-awaited model demonstrates near-human reasoning capabilities across a wide range of academic benchmarks.",
    location: "San Francisco, USA",
    source: "TechCrunch",
    sourceUrl: "https://techcrunch.com",
    whyItMatters: "GPT-5 establishes a new frontier in multimodal reasoning. It could automate complex enterprise workflows that previously required human oversight.",
    industry: "Software",
    timeAgo: "1 hour ago",
    size: 32
  },
  {
    id: "4",
    entityType: "News",
    title: "TSMC Expands AI Fabrication Plant",
    coordinates: [120.9820, 24.8138], // Hsinchu, Taiwan
    category: "Hardware",
    severity: "CRITICAL",
    summary: "Taiwan Semiconductor Manufacturing Company breaks ground on a massive new facility dedicated to advanced AI silicon.",
    location: "Hsinchu, Taiwan",
    source: "WSJ",
    sourceUrl: "https://wsj.com",
    whyItMatters: "By expanding capacity, TSMC is attempting to clear the massive bottleneck in global AI chip supply, ensuring steadier growth for AI hardware adoption.",
    industry: "Hardware",
    timeAgo: "2 hours ago",
    size: 20
  },
  {
    id: "5",
    entityType: "News",
    title: "AI Copyright Lawsuit Shakes Up Training Data",
    coordinates: [-74.0060, 40.7128], // New York, NY
    category: "Regulation",
    severity: "HIGH",
    summary: "A coalition of publishers files a landmark lawsuit against major AI labs, demanding royalties for copyrighted training materials.",
    location: "New York, USA",
    source: "The New York Times",
    sourceUrl: "https://nytimes.com",
    whyItMatters: "If the publishers win, AI companies may be forced to license data at steep premiums, disrupting the open-scraping model that built the current generation of models.",
    industry: "Media",
    timeAgo: "3 hours ago",
    size: 14
  },
  {
    id: "6",
    entityType: "News",
    title: "AlphaFold 3 Solves New Protein Structures",
    coordinates: [-0.1276, 51.5072], // London, UK
    category: "Research",
    severity: "CRITICAL",
    summary: "DeepMind's latest iteration of AlphaFold unlocks previously unsolvable protein folding challenges, accelerating drug discovery.",
    location: "London, UK",
    source: "Nature",
    sourceUrl: "https://nature.com",
    whyItMatters: "This breakthrough drastically reduces the time and cost required for pharmaceutical companies to identify viable new drug candidates.",
    industry: "Healthcare",
    timeAgo: "4 hours ago",
    size: 22
  },
  {
    id: "7",
    entityType: "News",
    title: "RoboTaxi Fleet Expansion Approved",
    coordinates: [-112.0740, 33.4484], // Phoenix, AZ
    category: "Software",
    severity: "CRITICAL",
    summary: "Waymo secures regulatory approval to double its autonomous vehicle fleet across major metropolitan areas.",
    location: "Phoenix, USA",
    source: "The Verge",
    sourceUrl: "https://theverge.com",
    whyItMatters: "Validates the commercial viability of Level 4 autonomy, paving the way for wider adoption of AI-driven logistics.",
    industry: "Automotive",
    timeAgo: "5 hours ago",
    size: 18
  },
  
  // --- MODELS & COMPANIES ---
  {
    id: "model-1",
    entityType: "Model",
    title: "Mistral Large Deployed in EU Hub",
    coordinates: [2.3522, 48.8566], // Paris, France
    category: "Software",
    severity: "ELEVATED",
    summary: "Mistral AI deploys its flagship open-weights model across multiple European datacenters, optimizing for sovereignty.",
    location: "Paris, France",
    source: "Mistral Blog",
    sourceUrl: "https://mistral.ai",
    whyItMatters: "Provides EU enterprises with a high-tier foundation model hosted within their regulatory borders.",
    industry: "Cloud",
    timeAgo: "10 hours ago",
    size: 16
  },
  {
    id: "model-2",
    entityType: "Model",
    title: "Claude 3.5 Opus Context Expanded",
    coordinates: [-122.3321, 47.6062], // Seattle, WA (AWS Bedrock region)
    category: "Software",
    severity: "CRITICAL",
    summary: "Anthropic increases the context window of Opus to 2 million tokens, available immediately via AWS.",
    location: "Seattle, USA",
    source: "AWS News",
    sourceUrl: "https://aws.amazon.com",
    whyItMatters: "Unlocks use cases like full-codebase analysis and complex genomic sequencing queries within a single prompt.",
    industry: "Software",
    timeAgo: "12 hours ago",
    size: 28
  },
  
  // --- MARKETS ---
  {
    id: "market-1",
    entityType: "Market",
    title: "NYSE: AI Index Fund Surges",
    coordinates: [-74.0113, 40.7069], // Wall Street, NY
    category: "Market",
    severity: "CRITICAL",
    summary: "The newly launched Global AI Infrastructure ETF sees record inflows in its first hour of trading.",
    location: "New York, USA",
    source: "CNBC",
    sourceUrl: "https://cnbc.com",
    whyItMatters: "Indicates retail and institutional investor confidence in the long-term hardware and power requirements of AI.",
    industry: "Finance",
    timeAgo: "LIVE",
    size: 30
  },
  {
    id: "market-2",
    entityType: "Market",
    title: "LSE: AI Fraud Detection Mandate",
    coordinates: [-0.0990, 51.5145], // London Stock Exchange
    category: "Regulation",
    severity: "ELEVATED",
    summary: "The UK Financial Conduct Authority requires all high-volume trading firms to deploy AI-based spoofing detection.",
    location: "London, UK",
    source: "Financial Times",
    sourceUrl: "https://ft.com",
    whyItMatters: "Forces rapid adoption of AI compliance tools across the European financial sector.",
    industry: "Finance",
    timeAgo: "1 day ago",
    size: 15
  },

  {
    id: "test-wrap",
    entityType: "News",
    title: "Test Wrap Point",
    coordinates: [-240.4194, 37.7749], // Way past the normal -180 bound
    category: "Software",
    severity: "CRITICAL",
    summary: "Testing if points show up correctly when wrapping.",
    location: "Wrap Test",
    source: "System",
    sourceUrl: "#",
    whyItMatters: "Testing.",
    industry: "Cloud",
    timeAgo: "Now",
    size: 32
  },
  {
    id: "8",
    entityType: "News",
    title: "AI Precision Farming Yields Record Harvest",
    coordinates: [-93.6091, 41.5868], // Des Moines, IA
    category: "Software",
    severity: "CRITICAL",
    summary: "A coalition of farms reports a 20% increase in yields using AI-driven drone imagery and automated soil nutrient balancing.",
    location: "Iowa, USA",
    source: "AgriTech Monthly",
    sourceUrl: "https://agritech.com",
    whyItMatters: "Proves that predictive agricultural AI can combat climate-induced yield volatility, ensuring long-term food security.",
    industry: "Robotics",
    timeAgo: "15 hours ago",
    size: 14
  },
  {
    id: "9",
    entityType: "News",
    title: "Automated Factory Surpasses Human Output",
    coordinates: [139.6917, 35.6895], // Tokyo, Japan
    category: "Hardware",
    severity: "CRITICAL",
    summary: "A Japanese manufacturing firm unveils the first 'lights-out' factory entirely operated and maintained by AI-driven robotics.",
    location: "Tokyo, Japan",
    source: "Nikkei Asia",
    sourceUrl: "https://nikkei.com",
    whyItMatters: "Represents the ultimate endpoint of industrial automation, severely disrupting traditional labor markets while boosting productivity.",
    industry: "Robotics",
    timeAgo: "20 hours ago",
    size: 26
  },
  {
    id: "10",
    entityType: "Company",
    title: "New AI Hub Opens in Dubai",
    coordinates: [35.2048, 31.7683], // Middle East proxy
    category: "Hardware",
    severity: "CRITICAL",
    summary: "A $5B sovereign wealth fund initiates the construction of a massive, liquid-cooled datacenter for regional AI startups.",
    location: "Dubai, UAE",
    source: "Gulf News",
    sourceUrl: "https://gulfnews.com",
    whyItMatters: "Diversifies the global concentration of AI compute away from North America and Europe.",
    industry: "Cloud",
    timeAgo: "2 days ago",
    size: 20
  },
  {
    id: "11",
    entityType: "News",
    title: "Personalized AI Tutors Deployed Nationwide",
    coordinates: [126.9780, 37.5665], // Seoul, South Korea
    category: "Software",
    severity: "CRITICAL",
    summary: "South Korea officially integrates personalized AI tutoring assistants into its public school curriculum.",
    location: "Seoul, South Korea",
    source: "EdSurge",
    sourceUrl: "https://edsurge.com",
    whyItMatters: "The first large-scale national deployment of AI in education, promising to democratize access to individualized instruction.",
    industry: "Education",
    timeAgo: "1 day ago",
    size: 18
  },
  {
    id: "12",
    entityType: "News",
    title: "Singapore AI Minister Unveils Gov-GPT",
    coordinates: [103.8198, 1.3521], // Singapore
    category: "Software",
    severity: "ELEVATED",
    summary: "The Singaporean government introduces a specialized LLM for handling citizen services and municipal data.",
    location: "Singapore",
    source: "Straits Times",
    sourceUrl: "https://straitstimes.com",
    whyItMatters: "Sets a precedent for sovereign AI models tailored to local governance and cultural context.",
    industry: "Software",
    timeAgo: "3 days ago",
    size: 14
  }
];
