import { chromium } from 'playwright';

(async () => {
    console.log('--- Debug: Launching Browser ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    const page = await browser.newPage();

    try {
        // 1. Test External Connectivity
        console.log('1. Testing Google.com...');
        await page.goto('https://www.google.com', { timeout: 15000 });
        console.log('✅ Google Loaded:', await page.title());
        await page.screenshot({ path: 'debug_google.png' });

        // 2. Test Localhost
        console.log('2. Testing Localhost:5173...');
        await page.goto('http://localhost:5173', { timeout: 15000 });
        console.log('✅ Localhost Loaded:', await page.title());
        await page.screenshot({ path: 'debug_localhost.png' });

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await browser.close();
    }
})();
