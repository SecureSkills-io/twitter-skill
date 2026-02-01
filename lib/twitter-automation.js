const { chromium } = require('playwright');

async function postTweet(text, cookiesJson) {
  const cookies = JSON.parse(cookiesJson);
  
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const page = await browser.newPage();
  
  // Set cookies
  await page.context().addCookies(cookies);
  
  // Navigate to X
  await page.goto('https://x.com/home', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Find and click compose box
  const composeSelectors = [
    '[data-testid="tweetTextarea_0"]',
    '[role="textbox"][contenteditable="true"]',
    '[data-testid="tweetButtonInline"]'
  ];
  
  // Try to find compose area
  let composeBox = null;
  for (const selector of composeSelectors) {
    composeBox = await page.$(selector);
    if (composeBox) break;
  }
  
  if (!composeBox) {
    // Try clicking the main compose button first
    const mainCompose = await page.$('a[href="/compose/post"]');
    if (mainCompose) {
      await mainCompose.click();
      await page.waitForTimeout(1000);
    }
  }
  
  // Click textbox and type
  const textbox = await page.$('[data-testid="tweetTextarea_0"], [role="textbox"][contenteditable="true"]');
  if (!textbox) {
    console.error('Compose box not found');
    await browser.disconnect();
    process.exit(1);
  }
  
  await textbox.click();
  await page.keyboard.type(text);
  await page.waitForTimeout(500);
  
  // Click post button
  const postBtn = await page.$('button[data-testid="tweetButtonInline"], button[data-testid="tweetButton"]');
  if (postBtn) {
    await postBtn.click();
    await page.waitForTimeout(3000);
    console.log('Tweet posted successfully');
  } else {
    console.error('Post button not found');
    await browser.disconnect();
    process.exit(1);
  }
  
  await page.close();
  await browser.disconnect();
}

async function extractCookies() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const context = browser.contexts()[0];
  const cookies = await context.cookies('https://x.com');
  console.log(JSON.stringify(cookies, null, 2));
  await browser.disconnect();
}

const command = process.argv[2];

if (command === 'post') {
  const text = process.argv[3];
  const cookiesJson = process.argv[4];
  postTweet(text, cookiesJson).catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
} else if (command === 'extract') {
  extractCookies().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
}