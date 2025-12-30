// utils/helpers.js
import fs from 'fs';
import path from 'path';

// ✅ Use /tmp directory (only writable location on Vercel)
const DB_FILE = path.join('/tmp', 'price_history.json');

// Initialize database file if it doesn't exist
function ensureDBExists() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ products: {} }, null, 2));
      console.log('✅ Price database initialized at:', DB_FILE);
    }
  } catch (error) {
    console.error('⚠️ Could not initialize price database:', error.message);
  }
}

export function readPriceDB() {
  try {
    ensureDBExists();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading price database:', error);
    return { products: {} };
  }
}

export function writePriceDB(data) {
  try {
    ensureDBExists();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing price database:', error);
  }
}

export function generateProductKey(productName, store) {
  return `${productName.toLowerCase().trim()}_${store.toLowerCase()}`;
}

export const waitFor = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Retry wrapper for resilient scraping
export async function withRetry(fn, retries = 2, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      if (i === retries) throw error;
      await waitFor(delay * (i + 1)); // Exponential backoff
    }
  }
}

// Extended cache (10 minutes for better reuse)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

export function getCacheKey(product, location) {
  return `${product.toLowerCase().trim()}_${location.toLowerCase().trim()}`;
}

export function getFromCache(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✅ Cache hit for: ${key}`);
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}
