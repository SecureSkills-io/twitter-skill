let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  try {
    ({ chromium } = require('/root/.nvm/versions/node/v24.12.0/lib/node_modules/openclaw/node_modules/playwright'));
  } catch (e2) {
    console.error('Playwright not found. Install: npm install -g playwright');
    process.exit(1);
  }
}
const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(process.env.HOME, '.config/twitter-skill');
const COOKIES_FILE = path.join(CONFIG_DIR, 'cookies.json');
const TEMP_FILE = path.join(CONFIG_DIR, '.temp-action.json');

async function postTweet() {
  // Read action details from temp file
  const action = JSON.parse(fs.readFileSync(TEMP_FILE, 'utf8'));
  const { text, cookies } = action;
  
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const page = await browser.newPage();
  
  await page.context().addCookies(cookies);
  await page.goto('https://x.com/home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Try to find textbox directly (it might already be visible)
  let textbox = await page.$('[data-testid="tweetTextarea_0"], textarea[aria-label="Post text"], [role="textbox"]');
  
  // If not found, try clicking compose button
  if (!textbox) {
    const composeBtn = await page.$('a[href="/compose/post"], [data-testid="SideNav_NewTweet_Button"], a[aria-label="Post"]');
    if (composeBtn) {
      await composeBtn.click();
      await page.waitForTimeout(1500);
      textbox = await page.$('[data-testid="tweetTextarea_0"], textarea[aria-label="Post text"], [role="textbox"]');
    }
  }
  
  if (!textbox) throw new Error('Compose box not found');
  await textbox.click();
  await page.keyboard.type(text);
  await page.waitForTimeout(500);
  
  // Post
  const postBtn = await page.$('button[data-testid="tweetButtonInline"], button[data-testid="tweetButton"]');
  if (postBtn) {
    await postBtn.click();
    await page.waitForTimeout(3000);
    console.log('Tweet posted');
  } else {
    throw new Error('Post button not found');
  }
  
  await page.close();
  await browser.close();
}

async function extractCookies() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const context = browser.contexts()[0];
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