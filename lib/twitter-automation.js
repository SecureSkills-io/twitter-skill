const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.env.HOME, '.config/twitter-skill');
const TEMP_FILE = path.join(CONFIG_DIR, '.temp-action.json');

async function postTweet() {
  const action = JSON.parse(fs.readFileSync(TEMP_FILE, 'utf8'));
  const { text, cookies } = action;
  
  // Connect to existing browser
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  
  // Use existing context or create new one with cookies
  let context = browser.contexts()[0];
  if (!context) {
    context = await browser.newContext();
  }
  
  // Add cookies to context
  await context.addCookies(cookies);
  
  // Create new page in this context
  const page = await context.newPage();
  
  await page.goto('https://x.com/compose/post', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Type - try multiple selectors
  const textbox = await page.$('[data-testid="tweetTextarea_0"]') 
    || await page.$('textarea[aria-label="Post text"]')
    || await page.$('[contenteditable="true"]');
    
  if (!textbox) {
    // Debug: screenshot
    await page.screenshot({ path: '/tmp/twitter-debug.png' });
    throw new Error('Compose box not found, screenshot at /tmp/twitter-debug.png');
  }
  
  await textbox.click();
  await page.keyboard.type(text);
  await page.waitForTimeout(500);
  
  // Post
  const postBtn = await page.$('button[data-testid="tweetButton"]');
  if (postBtn) {
    await postBtn.click();
    await page.waitForTimeout(3000);
    console.log('Tweet posted');
  } else {
    throw new Error('Post button not found');
  }
  
  await page.close();
  
  // Extract fresh cookies
  const freshCookies = await context.cookies('https://x.com');
  console.log('COOKIES_START');
  console.log(JSON.stringify(freshCookies));
  console.log('COOKIES_END');
  
  await browser.close();
}

async function extractCookies() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const context = browser.contexts()[0];
  if (!context) {
    console.log('[]');
    await browser.close();
    return;
  }
  const cookies = await context.cookies('https://x.com');
  console.log(JSON.stringify(cookies, null, 2));
  await browser.close();
}

const command = process.argv[2];
if (command === 'post') {
  postTweet().catch(e => { console.error('Error:', e.message); process.exit(1); });
} else if (command === 'extract') {
  extractCookies().catch(e => { console.error('Error:', e.message); process.exit(1); });
}