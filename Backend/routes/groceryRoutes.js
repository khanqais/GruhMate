import express from 'express';
import { scrapeZepto, scrapeJioMart } from '../controller/groceryScrapers.js';
import { getCacheKey, getFromCache, setCache } from '../utils/helpers.js';
import { getSharedBrowser } from '../utils/browserUtils.js';

const router = express.Router();

router.post('/search-grocery', async (req, res) => {
  let { location, product } = req.body;
  if (!product) {
    return res.status(400).json({ error: 'Product is required' });
  }

  if (!location) {
    location = 'Mumbai';
  }

  const cacheKey = getCacheKey(product, location);
  const cachedResult = getFromCache(cacheKey);
  if (cachedResult) {
    return res.json({
      ...cachedResult,
      cached: true,
      message: `${cachedResult.message} (from cache)`,
    });
  }

  console.log(`Searching grocery for "${product}" in "${location}"...`);
  const startTime = Date.now();

  try {
    await getSharedBrowser();

    const results = await Promise.allSettled([
      scrapeZepto(product, location),
      scrapeJioMart(location, product),
    ]);

    const zeptoResults =
      results[0].status === 'fulfilled' ? results[0].value : [];
    const jiomartResults =
      results[1].status === 'fulfilled' ? results[1].value : [];

    if (results[0].status === 'rejected') {
      console.error(
        'Zepto scraper failed after retries:',
        results[0].reason.message
      );
    }
    if (results[1].status === 'rejected') {
      console.error(
        'JioMart scraper failed after retries:',
        results[1].reason.message
      );
    }

    const responseData = {
      zepto: zeptoResults,
      jiomart: jiomartResults,
      message: `Found ${zeptoResults.length} Zepto products and ${jiomartResults.length} JioMart products`,
    };

    if (zeptoResults.length > 0 || jiomartResults.length > 0) {
      setCache(cacheKey, responseData);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Grocery search completed in ${duration}s`);

    res.json(responseData);
  } catch (error) {
    console.error('Error in grocery scraping:', error);
    res
      .status(500)
      .json({ error: 'Failed to scrape data', details: error.toString() });
  }
});

export default router;