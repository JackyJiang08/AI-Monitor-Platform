const { spawn } = require('child_process');
const path = require('path');

const FETCH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

function runFetcher() {
  console.log(`[${new Date().toISOString()}] Starting RSS fetcher...`);
  
  const fetcher = spawn('node', [path.join(__dirname, 'fetch_rss_news.js')], {
    stdio: 'inherit'
  });

  fetcher.on('close', (code) => {
    console.log(`[${new Date().toISOString()}] Fetcher exited with code ${code}. Waiting for next interval...`);
  });

  fetcher.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Failed to start fetcher:`, err);
  });
}

// Run immediately on start
runFetcher();

// And then periodically
setInterval(runFetcher, FETCH_INTERVAL_MS);
