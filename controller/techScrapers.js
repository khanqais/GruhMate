import { getSharedBrowser, setupRequestInterception, addStealth } from '../utils/browserUtils.js';
import { waitFor, withRetry } from '../utils/helpers.js';

export async function scrapeAmazon(product) {
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

      console.log(`Amazon: Searching for "${product}"...`);

      await page.goto(`https://www.amazon.in/s?k=${encodeURIComponent(product)}`, {
        waitUntil: 'domcontentloaded',
        timeout: 25000,
      });

      await waitFor(1500);

      const productSelectors = [
        '[data-component-type="s-search-result"]',
        '.s-result-item[data-asin]',
        'div[data-asin]:not([data-asin=""])',
      ];

      let productsFound = false;
      for (const selector of productSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          productsFound = true;
          console.log(`Amazon: Found products with selector: ${selector}`);
          break;
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
          if (products.length >= 10) break;

          const asin = item.getAttribute('data-asin');
          if (!asin || asin === '') continue;

          let name = '';
          const nameSelectors = [
            'h2 a span',
            'h2 span.a-text-normal',
            '.a-size-medium.a-text-normal',
            'h2 .a-size-base-plus',
            '.s-title-instructions-style span',
            'h2 span',
            'h2 a',
            'h2',
          ];

          for (const sel of nameSelectors) {
            const nameElem = item.querySelector(sel);
            if (nameElem && nameElem.innerText?.trim()) {
              name = nameElem.innerText.trim();
              if (name.length >= 3) break;
            }
          }

          if (!name || name.length < 3) {
            console.log('Skipping - no name');
            continue;
          }

          let price = 'No price';

          const priceWhole = item.querySelector('.a-price-whole')?.innerText?.trim();
          const priceFraction = item.querySelector('.a-price-fraction')?.innerText?.trim();

          if (priceWhole) {
            const priceSymbol =
              item.querySelector('.a-price-symbol')?.innerText?.trim() || '₹';
            price = `${priceSymbol}${priceWhole.replace(',', '')}${
              priceFraction ? '.' + priceFraction : ''
            }`;
          } else {
            const offscreenPrice =
              item.querySelector('.a-price .a-offscreen')?.innerText?.trim();
            if (offscreenPrice) {
              price = offscreenPrice;
            } else {
              const priceContainer = item.querySelector('.a-price');
              if (priceContainer) {
                const priceText = priceContainer.innerText || '';
                const priceMatch = priceText.match(/₹[\d,]+/);
                if (priceMatch) {
                  price = priceMatch[0];
                }
              } else {
                const itemText = item.innerText || '';
                const priceMatch = itemText.match(/₹\s*[\d,]+/);
                if (priceMatch) {
                  price = priceMatch[0].replace(/\s+/g, '');
                }
              }
            }
          }

          const imgElem =
            item.querySelector('img.s-image') ||
            item.querySelector('img[data-image-latency]') ||
            item.querySelector('.s-product-image-container img') ||
            item.querySelector('img');
          let image = '';
          if (imgElem) {
            image =
              imgElem.getAttribute('src') ||
              imgElem.getAttribute('data-image-source-density') ||
              imgElem.getAttribute('srcset')?.split(' ')[0] ||
              '';
          }

          let url = '';
          const linkElem =
            item.querySelector('h2 a') || item.querySelector('a.a-link-normal');
          if (linkElem) {
            const href = linkElem.getAttribute('href');
            if (href) {
              url = href.startsWith('http')
                ? href
                : `https://www.amazon.in${href}`;
            }
          }

          const weight = '';

          console.log(`Adding: ${name.substring(0, 40)} | ${price}`);
          products.push({ name, price, image, weight, store: 'Amazon', url });
        }

        console.log(`Returning ${products.length} products`);
        return products;
      });

      console.log(`Amazon: Extracted ${amazonProducts.length} products`);
      await page.close();
      return amazonProducts;
    } catch (error) {
      await page.close();
      throw error;
    }
  }, 3, 2000);
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
