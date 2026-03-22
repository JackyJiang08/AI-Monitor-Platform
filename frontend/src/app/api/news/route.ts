import { NextResponse } from 'next/server';
import { MapEntity, mockAiNewsEvents } from '@/lib/mockData';
import savedEventsData from '../../../../data/news.json';
import summaryDataRaw from '../../../../data/news_summary.json';

// Helper to calculate relative time dynamically
function calculateTimeAgo(publishedAt?: string): string {
  if (!publishedAt) return "Recently";
  const date = new Date(publishedAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} secs ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

// Instantiate RSS parser (removed unused import)
// const parser = new Parser();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ensure we handle both ES modules `{ default: [...] }` and direct JSON arrays
    const rawSavedEvents = (savedEventsData as any)?.default || savedEventsData;
    let savedEvents: MapEntity[] = Array.isArray(rawSavedEvents) ? rawSavedEvents : [];
    
    // Ensure mockAiNewsEvents is an array
    const safeMockEvents = Array.isArray(mockAiNewsEvents) ? mockAiNewsEvents : [];
    
    // Combine mock data (historical/previous events) with live RSS events
    const allEvents = [...savedEvents, ...safeMockEvents];
    
    // Read summary
    const rawSummaryData = (summaryDataRaw as any)?.default || summaryDataRaw;
    let summaryData: any = {};
    if (rawSummaryData) {
      summaryData = JSON.parse(JSON.stringify(rawSummaryData));
    }
    
    // Calculate timeAgo for summary bullets if they are objects
    if (summaryData && Array.isArray(summaryData.bullets)) {
      summaryData.bullets = summaryData.bullets.map((b: any) => {
         if (typeof b === 'object' && b !== null && b.publishedAt) {
             return { ...b, timeAgo: calculateTimeAgo(b.publishedAt) };
         }
         return b;
      });
    }

    // Dynamically calculate timeAgo for ALL events based on current server time
    const finalEvents = allEvents.map(event => ({
      ...event,
      timeAgo: calculateTimeAgo(event.publishedAt)
    }));

    return NextResponse.json({ events: finalEvents, summary: summaryData });

  } catch (error: unknown) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
