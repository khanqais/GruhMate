import { getSharedBrowser, setupRequestInterception, addStealth } from '../utils/browserUtils.js';
import { waitFor, withRetry } from '../utils/helpers.js';

export async function scrapeAmazon(product) {
  return withRetry(async () => {
    const browser = await getSharedBrowser();
    const page = await browser.newPage();

    try {
      // ✅ ENHANCED STEALTH FOR AMAZON
      await page.setRequestInterception(true);
      
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['font', 'media', 'video'].includes(resourceType)) {
          req.abort();
        } else {
          // ✅ Override headers to look more real
          req.continue({
            headers: {
              ...req.headers(),
              'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'accept-language': 'en-US,en;q=0.9',
              'accept-encoding': 'gzip, deflate, br',
              'sec-fetch-dest': 'document',
              'sec-fetch-mode': 'navigate',
              'sec-fetch-site': 'none',
              'upgrade-insecure-requests': '1',
            }
          });
        }
      });

      await page.setViewport({ width: 1920, height: 1080 });
      
      // ✅ More realistic user agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      );

      // ✅ Enhanced stealth
      await page.evaluateOnNewDocument(() => {
        // Hide automation
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        
        // Add realistic plugins
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            { name: 'Chrome PDF Plugin' },
            { name: 'Chrome PDF Viewer' },
            { name: 'Native Client' }
          ]
        });

        // Realistic permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications'
            ? Promise.resolve({ state: Notification.permission })
            : originalQuery(parameters)
        );

        // Add chrome object
        window.chrome = { runtime: {} };
        
        // Override WebGL vendor
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445) return 'Intel Inc.';
          if (parameter === 37446) return 'Intel Iris OpenGL Engine';
          return getParameter.apply(this, [parameter]);
        };
      });

      console.log(`Amazon: Searching for "${product}"...`);

      // ✅ Reduced timeout for Vercel
      await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(product)}`, {
        waitUntil: 'domcontentloaded',
        timeout: 8000, // ✅ Reduced from 25000
      });

      // ✅ Mimic human behavior
      await waitFor(800 + Math.random() * 400); // Random delay

      // ✅ Check for CAPTCHA or bot detection
      const isCaptcha = await page.evaluate(() => {
        return document.body.innerText.includes('Enter the characters you see below') ||
               document.body.innerText.includes('Type the characters') ||
               document.querySelector('form[action*="validateCaptcha"]') !== null;
      });

      if (isCaptcha) {
        console.log('⚠️ Amazon: CAPTCHA detected, returning empty array');
        await page.close();
        return [];
      }

      // Rest of your scraping logic...
      const productSelectors = [
        '[data-component-type="s-search-result"]',
        '.s-result-item[data-asin]',
        'div[data-asin]:not([data-asin=""])',
      ];

      let productsFound = false;
      for (const selector of productSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 }); // ✅ Reduced timeout
          productsFound = true;
          console.log(`Amazon: Found products with selector: ${selector}`);
          break;
        } catch {
          continue;
        }
      }

      if (!productsFound) {
        console.log('Amazon: No products found');
        await page.close();
        return [];
      }

      if (productsFound) {
        await page.evaluate(() => window.scrollBy(0, 500));
        await waitFor(300);
      }

      const amazonProducts = await page.evaluate(() => {
        const products = [];

        let items = document.querySelectorAll('[data-component-type="s-search-result"]');
        if (items.length === 0) {
          items = document.querySelectorAll('.s-result-item[data-asin]');
        }
        if (items.length === 0) {
          items = document.querySelectorAll('div[data-asin]:not([data-asin=""])');
        }

        console.log(`Found ${items.length} potential items`);

        for (const item of items) {
          if (products.length >= 5) break; // ✅ Reduced from 10

          const asin = item.getAttribute('data-asin');
          if (!asin || asin === '') continue;

          let name = '';
          const nameSelectors = [
            'h2 a span',
            'h2 span.a-text-normal',
            '.a-size-medium.a-text-normal',
            'h2 .a-size-base-plus',
            'h2 span',
          ];

          for (const sel of nameSelectors) {
            const nameElem = item.querySelector(sel);
            if (nameElem && nameElem.innerText?.trim()) {
              name = nameElem.innerText.trim();
              if (name.length >= 3) break;
            }
          }

          if (!name || name.length < 3) continue;

          let price = 'No price';
          const priceWhole = item.querySelector('.a-price-whole')?.innerText?.trim();
          const priceFraction = item.querySelector('.a-price-fraction')?.innerText?.trim();

          if (priceWhole) {
            const priceSymbol = item.querySelector('.a-price-symbol')?.innerText?.trim() || '₹';
            price = `${priceSymbol}${priceWhole.replace(',', '')}${priceFraction ? '.' + priceFraction : ''}`;
          } else {
            const offscreenPrice = item.querySelector('.a-price .a-offscreen')?.innerText?.trim();
            if (offscreenPrice) price = offscreenPrice;
          }

          const imgElem = item.querySelector('img.s-image') || item.querySelector('img[data-image-latency]') || item.querySelector('img');
          let image = '';
          if (imgElem) {
            image = imgElem.getAttribute('src') || '';
          }

          let url = '';
          const linkElem = item.querySelector('h2 a') || item.querySelector('a.a-link-normal');
          if (linkElem) {
            const href = linkElem.getAttribute('href');
            if (href) {
              url = href.startsWith('http') ? href : `https://www.amazon.in${href}`;
            }
          }

          products.push({ name, price, image, weight: '', store: 'Amazon', url });
        }

        return products;
      });

      console.log(`Amazon: Extracted ${amazonProducts.length} products`);
      await page.close();
      return amazonProducts;
    } catch (error) {
      console.error('Amazon error:', error.message);
      await page.close();
      return []; // ✅ Return empty instead of throwing
    }
  }, 2, 1000); // ✅ Only 2 retries with 1s delay
}


// Flipkart scraper
export async function scrapeFlipkart(product) {
  return withRetry(async () => {
    const browser = await getSharedBrowser();
    const page = await browser.newPage();

    try {
      await page.setRequestInterception(true);
      setupRequestInterception(page);

      await page.setViewport({ width: 1280, height: 800 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      await addStealth(page);

      console.log(`Flipkart: Searching for "${product}"...`);

      await page.goto(`https://www.flipkart.com/search?q=${encodeURIComponent(product)}`, {
        waitUntil: 'domcontentloaded',
        timeout: 25000,
      });

      await waitFor(1500);

      const productSelectors = ['[data-id]', '._1AtVbE', '.tUxRFH', '._2kHMtA'];

      let productsFound = false;
      for (const selector of productSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          const count = await page.$$eval(selector, (els) => els.length);
          if (count > 0) {
            productsFound = true;
            console.log(
              `Flipkart: Found ${count} items with selector: ${selector}`
            );
            break;
          }
        } catch {
          continue;
        }
      }

      if (productsFound) {
        await page.evaluate(() => window.scrollBy(0, 800));
        await waitFor(800);
        await page.evaluate(() => window.scrollBy(0, 800));
        await waitFor(500);
      }

      const flipkartProducts = await page.evaluate(() => {
        const products = [];

        let items = document.querySelectorAll('[data-id]');
        if (items.length === 0) {
          items = document.querySelectorAll('._1AtVbE');
        }
        if (items.length === 0) {
          items = document.querySelectorAll('.tUxRFH');
        }
        if (items.length === 0) {
          items = document.querySelectorAll('div._2kHMtA, div._13oc-S');
        }

        console.log(`Found ${items.length} potential Flipkart items`);

        for (const item of items) {
          if (products.length >= 10) break;

          let name = '';
          const nameSelectors = [
            'a[title]',
            '.s1Q9rs',
            '._4rR01T',
            'a.IRpwTa',
            '._2WkVRV',
            '.s1Q9rs a',
            'a.s1Q9rs',
            'div._4rR01T',
            'a',
            '.KzDlHZ',
          ];

          for (const sel of nameSelectors) {
            const nameElem = item.querySelector(sel);
            if (nameElem) {
              const titleAttr = nameElem.getAttribute('title');
              const textContent = nameElem.innerText?.trim();
              name = titleAttr || textContent || '';
              if (name && name.length >= 3) break;
            }
          }

          if (!name || name.length < 3) {
            console.log('Skipping Flipkart item - no name');
            continue;
          }

          let price = 'No price';
          const priceSelectors = [
            '._30jeq3',
            '._1_WHN1',
            '.Nx9bqj',
            '._30jeq3._1_WHN1',
            'div._30jeq3',
            '._25b18c',
            '._16Jk6d',
            '.Nx9bqj.CxhGGd',
          ];

          for (const sel of priceSelectors) {
            const priceElem = item.querySelector(sel);
            if (priceElem && priceElem.innerText?.trim()) {
              price = priceElem.innerText.trim();
              break;
            }
          }

          if (price === 'No price') {
            const allText = item.innerText || '';
            const priceMatch = allText.match(/₹[\d,]+/);
            if (priceMatch) {
              price = priceMatch[0];
            }
          }

          let image = '';
          const imgSelectors = [
            'img._396cs4',
            'img._2r_T1I',
            'img[loading="eager"]',
            'img.CXW8mj',
            'img._53J4C-',
            'img',
          ];

          for (const sel of imgSelectors) {
            const imgElem = item.querySelector(sel);
            if (imgElem) {
              const src =
                imgElem.getAttribute('src') ||
                imgElem.getAttribute('data-src') ||
                imgElem.getAttribute('srcset')?.split(' ')[0] ||
                '';
              if (
                src &&
                !src.startsWith('data:image') &&
                !src.includes('placeholder')
              ) {
                image = src;
                break;
              }
            }
          }

          let url = '';
          const linkElem =
            item.querySelector('a[href*="/p/"]') ||
            item.querySelector('a.s1Q9rs') ||
            item.querySelector('a');
          if (linkElem) {
            const href = linkElem.getAttribute('href');
            if (href) {
              url = href.startsWith('http')
                ? href
                : `https://www.flipkart.com${href}`;
            }
          }

          const weight = '';

          console.log(`Adding Flipkart: ${name.substring(0, 40)} | ${price}`);
          products.push({ name, price, image, weight, store: 'Flipkart', url });
        }

        console.log(`Returning ${products.length} Flipkart products`);
        return products;
      });

      console.log(`Flipkart: Extracted ${flipkartProducts.length} products`);
      await page.close();
      return flipkartProducts;
    } catch (error) {
      await page.close();
      throw error;
    }
  }, 3, 2000);
}
