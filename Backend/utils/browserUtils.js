import chromium from '@sparticuz/chromium';

let sharedBrowser = null;
let browserLaunchPromise = null;

export async function getSharedBrowser() {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    console.log('♻️ Reusing existing browser instance');
    return sharedBrowser;
  }

  if (browserLaunchPromise) {
    console.log('⏳ Waiting for browser launch...');
    return browserLaunchPromise;
  }

  browserLaunchPromise = (async () => {
    try {
      // ✅ Detect if running on Vercel/AWS Lambda
      const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

      if (isProduction) {
        // ========================================
        // VERCEL/PRODUCTION: Use serverless Chromium
        // ========================================
        console.log('🚀 Launching serverless Chromium (Vercel)...');
        const puppeteerCore = (await import('puppeteer-core')).default;
        
        return await puppeteerCore.launch({
          args: [
            ...chromium.args,
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-first-run',
            '--no-sandbox',
            '--no-zygote',
            '--single-process',
          ],
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        });
      } else {
        // ========================================
        // LOCAL DEVELOPMENT: Use regular Puppeteer
        // ========================================
        console.log('🚀 Launching local Puppeteer (bundled Chrome)...');
        const puppeteer = (await import('puppeteer')).default;
        
        return await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',
          ],
        });
      }
    } catch (error) {
      console.error('❌ Browser launch failed:', error.message);
      browserLaunchPromise = null;
      throw error;
    }
  })();

  sharedBrowser = await browserLaunchPromise;
  browserLaunchPromise = null;
  console.log('✅ Browser launched successfully');
  return sharedBrowser;
}

export function setupRequestInterception(page) {
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    const url = req.url();

    // Block unnecessary resources to speed up scraping
    if (
      ['stylesheet', 'font', 'media', 'video', 'audio'].includes(resourceType) ||
      url.includes('analytics') ||
      url.includes('google-analytics') ||
      url.includes('facebook') ||
      url.includes('doubleclick') ||
      url.includes('amazon-adsystem') ||
      url.includes('googlesyndication') ||
      url.includes('googletagmanager') ||
      url.includes('hotjar') ||
      url.includes('mixpanel') ||
      url.includes('tracking')
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });
}

export async function addStealth(page) {
  // Make browser look more like a real user
  await page.evaluateOnNewDocument(() => {
    // Hide webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });

    // Mock plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // Mock languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    // Add chrome object
    window.chrome = {
      runtime: {},
    };

    // Mock permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
  });
}

export async function closeBrowser() {
  if (sharedBrowser) {
    console.log('🔒 Closing browser...');
    await sharedBrowser.close();
    sharedBrowser = null;
    console.log('✅ Browser closed');
  }
}