
import { getSharedBrowser, setupRequestInterception, addStealth } from '../utils/browserUtils.js';
import { waitFor, withRetry } from '../utils/helpers.js';


const SCRAPER_CONFIG = {
  viewport: { width: 1280, height: 800 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  timeout: 15000,
  waitAfterLoad: 1000,
  maxProducts: 10,
};

export async function scrapeZepto(product, location) {
  return withRetry(async () => {
    const browser = await getSharedBrowser();
    const page = await browser.newPage();

    try {
      await page.setRequestInterception(true);

      
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['font', 'media', 'video'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.setViewport(SCRAPER_CONFIG.viewport);
      await page.setUserAgent(SCRAPER_CONFIG.userAgent);
      await addStealth(page);

      console.log(`Zepto: Searching for "${product}"...`);

      await page.goto(
        `https://www.zeptonow.com/search?query=${encodeURIComponent(product)}`,
        { waitUntil: 'networkidle2', timeout: SCRAPER_CONFIG.timeout }
      );

      await waitFor(SCRAPER_CONFIG.waitAfterLoad);

     
      await page.evaluate(() => {
        window.scrollTo(0, 800);
      });
      await waitFor(800);

     
      const selectors = [
        'a[href*="/pn/"]',
        'a[href*="/prn/"]',
        '[data-testid="product-card"]',
        'div[class*="product"]',
        'div[class*="ProductCard"]',
      ];

      let productsFound = false;

      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          const count = await page.$$eval(selector, (els) => els.length);
          if (count > 0) {
            console.log(`Zepto: Found ${count} products with selector: ${selector}`);
            productsFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!productsFound) {
        console.log('Zepto: No products found');
        await page.close();
        return [];
      }

      const zeptoProducts = await page.evaluate((maxProducts) => {
        const products = [];
        const seenNames = new Set();
        const cards = document.querySelectorAll(
          'a[href*="/pn/"], a[href*="/prn/"], [data-testid="product-card"]'
        );

        for (const card of cards) {
          if (products.length >= maxProducts) break;

          const text = card.innerText || '';
          if (text.length < 5) continue;

         
          let name = '';
          const nameEl =
            card.querySelector('[data-testid="product-card-name"]') ||
            card.querySelector('h4') ||
            card.querySelector('h3') ||
            card.querySelector('[class*="name"]') ||
            card.querySelector('[class*="title"]');

          if (nameEl) {
            name = nameEl.innerText.trim();
          } else {
            const lines = text
              .split('\n')
              .map((l) => l.trim())
              .filter((l) => l);
            for (const line of lines) {
              if (line.startsWith('₹')) continue;
              if (line.match(/^\d+\s*(g|kg|ml|l|gm|pc|pcs)$/i)) continue;
              if (line.match(/^\d+%/)) continue;
              if (['ADD', 'NOTIFY', 'Out of Stock'].includes(line)) continue;
              if (line.length >= 3 && line.length <= 100) {
                name = line;
                break;
              }
            }
          }

          if (!name || name.length < 3 || seenNames.has(name)) continue;
          seenNames.add(name);

          
          let price = 'Price unavailable';
          const priceEl =
            card.querySelector('[data-testid="product-card-price"]') ||
            card.querySelector('[class*="price"]') ||
            card.querySelector('[class*="Price"]');
          if (priceEl) {
            price = priceEl.innerText.trim();
          } else {
            const priceMatch = text.match(/₹\s*[\d,]+/);
            if (priceMatch) price = priceMatch[0].replace(/\s/g, '');
          }

         
          let weight = '';
          const weightEl =
            card.querySelector('[data-testid="product-card-quantity"]') ||
            card.querySelector('[class*="quantity"]') ||
            card.querySelector('[class*="Quantity"]');
          if (weightEl) {
            weight = weightEl.innerText.trim();
          } else {
            const weightMatch = text.match(/\d+\s*(g|kg|ml|l|gm|pc|pcs|pack)/i);
            if (weightMatch) weight = weightMatch[0];
          }

          
          const img = card.querySelector('img');
          let image = '';
          if (img) {
            const src =
              img.getAttribute('data-src') ||
              img.getAttribute('data-lazy') ||
              img.getAttribute('data-lazy-src') ||
              img.getAttribute('data-original') ||
              img.getAttribute('srcset')?.split(' ')[0] ||
              img.getAttribute('data-srcset')?.split(' ')[0] ||
              img.src ||
              '';

            if (
              src &&
              !src.includes('data:image') &&
              !src.includes('placeholder') &&
              !src.includes('base64') &&
              src.length > 10
            ) {
              image = src.startsWith('http')
                ? src
                : `https://www.zeptonow.com${src}`;
            }
          }

         
          const href =
            card.getAttribute('href') ||
            card.closest('a')?.getAttribute('href') ||
            '';
          const url = href
            ? href.startsWith('http')
              ? href
              : `https://www.zeptonow.com${href}`
            : '';

          products.push({ name, price, image, weight, store: 'Zepto', url });
        }

        return products;
      }, SCRAPER_CONFIG.maxProducts);

      console.log(`Zepto: Extracted ${zeptoProducts.length} products`);
      await page.close();
      return zeptoProducts;
    } catch (error) {
      await page.close();
      throw error;
    }
  }, 2, 500);
}

export async function scrapeJioMart(location, product) {
  return withRetry(async () => {
    const browser = await getSharedBrowser();
    const page = await browser.newPage();

    try {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(SCRAPER_CONFIG.userAgent);
      await page.setRequestInterception(true);

      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['font', 'media', 'video'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await addStealth(page);

      console.log(`JioMart: Searching for "${product}"...`);

      const searchUrl = `https://www.jiomart.com/search/${encodeURIComponent(
        product
      )}`;
      await page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 15000,
      });

      await waitFor(1000);

      
      try {
        const locationButtons = await page.$$('button');
        for (const btn of locationButtons) {
          const text = await page.evaluate((el) => el.innerText, btn);
          if (
            text &&
            (text.includes('Enable Location') ||
              text.includes('Close') ||
              text.includes('×'))
          ) {
            await btn.click().catch(() => {});
            console.log('JioMart: Closed location popup');
            await waitFor(300);
            break;
          }
        }
      } catch (e) {
        
      }

      await page.evaluate(() => window.scrollBy(0, 800));
      await waitFor(800);

      const selectorStrategies = [
        'a[href*="/p/groceries/"]',
        'a[href*="/p/"]',
        'div[class*="plp-card"]',
        'div[class*="sku-item"]',
        'div[class*="product"]',
        'div[data-testid*="product"]',
      ];

      let productsFound = false;
      let selectedSelector = null;

      for (const selector of selectorStrategies) {
        try {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            const hasProductData = await page.evaluate((sel) => {
              const els = document.querySelectorAll(sel);
              if (els.length === 0) return false;

              for (let i = 0; i < Math.min(3, els.length); i++) {
                const text = els[i].innerText || '';
                if (text.includes('₹') || text.match(/\d+\s*(g|kg|ml|l)/i)) {
                  return true;
                }
              }
              return false;
            }, selector);

            if (hasProductData) {
              productsFound = true;
              selectedSelector = selector;
              console.log(
                `JioMart: Found ${elements.length} products with selector: ${selector}`
              );
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }

      if (!productsFound) {
        console.log('JioMart: Trying aggressive scroll...');
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await waitFor(1000);

        const retryElements = await page.$$('a[href*="/p/"]');
        if (retryElements.length > 0) {
          productsFound = true;
          selectedSelector = 'a[href*="/p/"]';
          console.log(
            `JioMart: Found ${retryElements.length} products after scroll`
          );
        }
      }

      if (!productsFound) {
        const bodyText = await page.evaluate(() => document.body.innerText);
        const snippet = bodyText.substring(0, 500);

        if (
          bodyText.includes('No products found') ||
          bodyText.includes('No results')
        ) {
          console.log('JioMart: No products found for this search term');
        } else if (
          bodyText.includes('Sign In') ||
          bodyText.includes('delivery to:')
        ) {
          console.log('JioMart: Location/auth barrier detected');
        } else {
          console.log(`JioMart debug: No selectors matched. Body snippet: ${snippet}`);
        }

        await page.close();
        return [];
      }

      const jiomartProducts = await page.evaluate(
        (selector, maxProducts) => {
          const products = [];
          const seenNames = new Set();

          let elements = Array.from(document.querySelectorAll(selector));

          if (selector.includes('a[href')) {
            elements = elements.filter((el) => {
              const href = el.getAttribute('href');
              return (
                href &&
                (href.includes('/p/groceries/') || href.includes('/p/'))
              );
            });
          }

          for (const element of elements) {
            if (products.length >= maxProducts) break;

            try {
              let productCard = element;
              if (element.tagName !== 'A') {
                const link = element.querySelector('a[href*="/p/"]');
                if (link) productCard = link;
              }

              const allText = productCard.innerText || '';
              if (!allText || allText.length < 10) continue;

              const lines = allText
                .split('\n')
                .map((l) => l.trim())
                .filter((l) => l.length > 0);

              let name = '';
              for (const line of lines) {
                if (line.startsWith('₹')) continue;
                if (line.match(/^\d+$/)) continue;
                if (
                  ['ADD', 'Buy Now', 'Add to Cart', 'Out of Stock', 'Notify Me'].includes(
                    line
                  )
                )
                  continue;
                if (line.match(/^\d+%\s*off$/i)) continue;
                if (line.match(/^\d+\s*(g|kg|ml|l|pc|pack)$/i)) continue;
                if (line.length < 5 || line.length > 150) continue;

                name = line;
                break;
              }

              if (!name || seenNames.has(name)) continue;
              seenNames.add(name);

              let price = 'No price';
              const priceMatch = allText.match(/₹\s*(\d+[,\d]*)/);
              if (priceMatch) {
                price = `₹${priceMatch[1]}`;
              }

              let weight = '';
              for (const line of lines) {
                if (
                  line.match(
                    /^\d+\s*(g|kg|ml|l|pc|pack|gm|ltr)$/i
                  )
                ) {
                  weight = line;
                  break;
                }
              }

              const img = productCard.querySelector('img');
              let image = '';
              if (img) {
                const src =
                  img.getAttribute('data-src') ||
                  img.getAttribute('data-lazy-src') ||
                  img.getAttribute('data-original') ||
                  img.getAttribute('srcset')?.split(' ')[0] ||
                  img.getAttribute('data-srcset')?.split(' ')[0] ||
                  img.getAttribute('src') ||
                  '';

                if (
                  src &&
                  !src.includes('data:image') &&
                  !src.includes('placeholder') &&
                  !src.includes('base64') &&
                  src.length > 10
                ) {
                  image = src.startsWith('http')
                    ? src
                    : `https://www.jiomart.com${src}`;
                }
              }

              let url = '';
              if (productCard.tagName === 'A') {
                const href = productCard.getAttribute('href');
                if (href) {
                  url = href.startsWith('http')
                    ? href
                    : `https://www.jiomart.com${href}`;
                }
              } else {
                const link = productCard.querySelector('a[href*="/p/"]');
                if (link) {
                  const href = link.getAttribute('href');
                  url = href
                    ? href.startsWith('http')
                      ? href
                      : `https://www.jiomart.com${href}`
                    : '';
                }
              }

              products.push({
                name,
                price,
                weight,
                image,
                store: 'JioMart',
                url,
              });
            } catch (err) {
              continue;
            }
          }

          return products;
        },
        selectedSelector,
        SCRAPER_CONFIG.maxProducts
      );

      console.log(`JioMart: Extracted ${jiomartProducts.length} products`);
      await page.close();
      return jiomartProducts;
    } catch (error) {
      console.error('JioMart error:', error.message);
      await page.close();
      throw error;
    }
  }, 3, 1500);
}
