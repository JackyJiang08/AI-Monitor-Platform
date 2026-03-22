export interface TopModel {
  id: string; // use OpenRouter ID
  name: string;
  provider: string;
  type: "Proprietary" | "Open Source" | "Open Weights";
  context: number;
  mmlu: number;
  humanEval: number;
  math: number;
  speed: number;
  ttft: number;
  inputCost: number;
  outputCost: number;
  elo: number;
  vision: boolean;
  tools: boolean;
  badge?: string;
  url?: string;
}

export interface GlobalModel {
  id: string;
  name: string;
  provider: string;
  context: number;
  inputCost: number;
  outputCost: number;
}

const benchmarkData: Record<string, Partial<TopModel>> = {
  "openai/gpt-5.4-pro": { name: "GPT-5.4 Thinking", elo: 1390, mmlu: 94.5, humanEval: 96.0, math: 97.0, speed: 65, ttft: 0.9, vision: true, tools: true, type: "Proprietary", badge: "SOTA Leader", url: "https://openai.com/api/" },
  "google/gemini-3.1-pro-preview": { name: "Gemini 3.1 Pro", elo: 1385, mmlu: 93.0, humanEval: 95.5, math: 96.0, speed: 85, ttft: 0.7, vision: true, tools: true, type: "Proprietary", badge: "Top Multimodal", url: "https://deepmind.google/technologies/gemini/" },
  "anthropic/claude-opus-4.6": { name: "Claude 3.7 Opus", elo: 1380, mmlu: 92.5, humanEval: 94.5, math: 93.5, speed: 60, ttft: 1.0, vision: true, tools: true, type: "Proprietary", badge: "Best Reasoning", url: "https://www.anthropic.com/claude" },
  "google/gemini-3-pro-preview": { name: "Gemini 3.0 Ultra", elo: 1370, mmlu: 91.5, humanEval: 93.0, math: 92.5, speed: 55, ttft: 1.2, vision: true, tools: true, type: "Proprietary", url: "https://deepmind.google/technologies/gemini/" },
  "deepseek/deepseek-v3.2": { name: "DeepSeek R2", elo: 1365, mmlu: 90.5, humanEval: 93.5, math: 96.5, speed: 70, ttft: 0.8, vision: false, tools: true, type: "Open Weights", badge: "Top Open Weights", url: "https://www.deepseek.com/" },
  "anthropic/claude-3.7-sonnet": { name: "Claude 3.7 Sonnet", elo: 1360, mmlu: 89.4, humanEval: 92.0, math: 90.5, speed: 75, ttft: 0.8, vision: true, tools: true, type: "Proprietary", badge: "Arena Leader", url: "https://www.anthropic.com/claude" },
  "openai/o1": { name: "o1", elo: 1350, mmlu: 90.8, humanEval: 92.4, math: 94.8, speed: 45, ttft: 2.5, vision: true, tools: true, type: "Proprietary", badge: "Top Reasoning", url: "https://openai.com/index/o1-and-o1-mini/" },
  "openai/o3-mini": { name: "o3-mini", elo: 1330, mmlu: 87.5, humanEval: 90.2, math: 92.0, speed: 120, ttft: 0.4, vision: false, tools: true, type: "Proprietary", badge: "Fast Reasoning", url: "https://openai.com/api/" },
  "x-ai/grok-3": { name: "Grok 3", elo: 1345, mmlu: 88.0, humanEval: 90.5, math: 91.0, speed: 85, ttft: 0.6, vision: true, tools: true, type: "Proprietary", badge: "SOTA", url: "https://x.ai/" },
  "deepseek/deepseek-r1": { name: "DeepSeek R1", elo: 1340, mmlu: 89.0, humanEval: 91.5, math: 93.5, speed: 60, ttft: 0.9, vision: false, tools: true, type: "Open Weights", badge: "Top Open Weights", url: "https://www.deepseek.com/" },
  "google/gemini-2.5-pro": { name: "Gemini 2.5 Pro", elo: 1335, mmlu: 88.5, humanEval: 90.0, math: 90.5, speed: 80, ttft: 0.7, vision: true, tools: true, type: "Proprietary", url: "https://deepmind.google/technologies/gemini/" },
  "openai/gpt-4o": { name: "GPT-4o", elo: 1285, mmlu: 88.7, humanEval: 90.2, math: 76.6, speed: 105, ttft: 0.5, vision: true, tools: true, type: "Proprietary", badge: "Versatile", url: "https://openai.com/api/" },
  "anthropic/claude-3.5-sonnet": { name: "Claude 3.5 Sonnet", elo: 1270, mmlu: 88.3, humanEval: 92.0, math: 71.1, speed: 85, ttft: 0.6, vision: true, tools: true, type: "Proprietary", badge: "Best Coding", url: "https://www.anthropic.com/claude" },
  "google/gemini-1.5-pro": { name: "Gemini 1.5 Pro", elo: 1260, mmlu: 85.9, humanEval: 84.1, math: 67.7, speed: 70, ttft: 0.8, vision: true, tools: true, type: "Proprietary", badge: "Massive Context", url: "https://deepmind.google/technologies/gemini/" },
  "deepseek/deepseek-chat": { name: "DeepSeek V3", elo: 1300, mmlu: 87.5, humanEval: 89.0, math: 88.5, speed: 110, ttft: 0.5, vision: false, tools: true, type: "Open Weights", url: "https://www.deepseek.com/" },
  "meta-llama/llama-3.3-70b-instruct": { name: "Llama 3.3 70B", elo: 1265, mmlu: 85.5, humanEval: 81.5, math: 73.0, speed: 95, ttft: 0.6, vision: false, tools: true, type: "Open Source", badge: "Top Open Source", url: "https://llama.meta.com/" },
  "meta-llama/llama-3.1-405b": { name: "Llama 3.1 405B", elo: 1275, mmlu: 88.6, humanEval: 89.0, math: 73.8, speed: 50, ttft: 1.0, vision: false, tools: true, type: "Open Source", url: "https://llama.meta.com/" },
  "qwen/qwen-max": { name: "Qwen Max", elo: 1280, mmlu: 87.0, humanEval: 88.5, math: 85.0, speed: 90, ttft: 0.7, vision: true, tools: true, type: "Proprietary", url: "https://chat.qwenlm.ai/" },
};

export async function fetchLiveModels() {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);

    const data = await res.json();
    const openRouterModels = data.data;

    const topModels: TopModel[] = [];
    const globalModels: GlobalModel[] = [];

    for (const model of openRouterModels) {
      const providerId = model.id.split('/')[0];
      let formattedProvider = providerId.charAt(0).toUpperCase() + providerId.slice(1).replace('-', ' ');
      if (formattedProvider.toLowerCase() === "meta llama") formattedProvider = "Meta";
      if (formattedProvider.toLowerCase() === "x ai") formattedProvider = "xAI";
      if (formattedProvider.toLowerCase() === "openai") formattedProvider = "OpenAI";
      if (formattedProvider.toLowerCase() === "anthropic") formattedProvider = "Anthropic";
      
      const inputCostRaw = model.pricing?.prompt || "0";
      const outputCostRaw = model.pricing?.completion || "0";
      const inputCost = parseFloat(inputCostRaw) * 1000000;
      const outputCost = parseFloat(outputCostRaw) * 1000000;
      const context = Math.round((model.context_length || 0) / 1000);

      // Clean name
      let cleanName = model.name || model.id;
      const prefixOptions = [`${formattedProvider}: `, `${formattedProvider} `, `${providerId}: `, `${providerId} `, `${providerId.charAt(0).toUpperCase() + providerId.slice(1)}: `, `${providerId.charAt(0).toUpperCase() + providerId.slice(1)} `];
      for (const prefix of prefixOptions) {
        if (cleanName.toLowerCase().startsWith(prefix.toLowerCase())) {
          cleanName = cleanName.substring(prefix.length).trim();
          break;
        }
      }

      globalModels.push({
        id: model.id,
        name: cleanName,
        provider: formattedProvider,
        context,
        inputCost,
        outputCost
      });

      if (benchmarkData[model.id]) {
        const bm = benchmarkData[model.id] as any;
        topModels.push({
          id: model.id,
          name: bm.name,
          provider: formattedProvider,
          type: bm.type,
          context,
          mmlu: bm.mmlu,
          humanEval: bm.humanEval,
          math: bm.math,
          speed: bm.speed,
          ttft: bm.ttft,
          inputCost,
          outputCost,
          elo: bm.elo,
          vision: bm.vision,
          tools: bm.tools,
          badge: bm.badge,
          url: bm.url
        });
      }
    }

    return {
      topModels: topModels.sort((a, b) => b.elo - a.elo),
      globalModels: globalModels.sort((a, b) => a.name.localeCompare(b.name))
    };
  } catch (err) {
    console.error("Failed to fetch from OpenRouter:", err);
    return { topModels: [], globalModels: [] };
  }
}