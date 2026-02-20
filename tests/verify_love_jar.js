import { chromium } from 'playwright';

const TARGET_URL = 'http://localhost:5173';

(async () => {
    console.log('--- Launching Browser (Headless + Sandbox Args)... ---');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        timeout: 30000
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('--- Starting UI Verification ---');

    try {
        // 1. Verify Login Page
        console.log('1. Navigating to Login Page...');
        await page.goto(TARGET_URL);
        await page.waitForTimeout(2000); // Wait for animations

        const title = await page.title();
        console.log(`Page Title: ${title}`);

        // Check for "The Secret Portal" text
        const portalText = await page.textContent('h1');
        if (portalText.includes('The Secret Portal')) {
            console.log('✅ "The Secret Portal" header found.');
        } else {
            console.error('❌ "The Secret Portal" header NOT found.');
        }

        // Check for "Create New Space" button
        const createBtn = page.getByRole('button', { name: 'Create New Space' });
        if (await createBtn.isVisible()) {
            console.log('✅ "Create New Space" button visible.');
        } else {
            console.error('❌ "Create New Space" button NOT visible.');
        }

        await page.screenshot({ path: 'login_page.png', fullPage: true });

        // 2. Test Account Creation Flow
        console.log('2. Testing Account Creation...');
        await createBtn.click();
        await page.waitForTimeout(2000); // Wait for creation simulation

        // Should redirect to Love Jar
        const url = page.url();
        if (!url.includes('login')) {
            console.log(`✅ Redirected to App: ${url}`);
        } else {
            console.error('❌ Failed to redirect after creation.');
        }

        // 3. Verify Love Jar View
        console.log('3. Verifying Love Jar View...');
        await page.waitForSelector('.jar-container');

        // Check for "Our Shared Jar" title
        const jarTitle = await page.textContent('h1');
        if (jarTitle.includes('Our Shared Jar')) {
            console.log('✅ "Our Shared Jar" title found.');
        } else {
            console.error('❌ "Our Shared Jar" title NOT found.');
        }

        await page.screenshot({ path: 'love_jar_view.png', fullPage: true });

        // 4. Verify Admin Dashboard
        console.log('4. Navigating to Admin Dashboard...');
        await page.goto(`${TARGET_URL}/#admin`);
        await page.reload(); // Hash change sometimes needs reload in SPA if checks are strict
        await page.waitForTimeout(1000);

        const adminTitle = await page.textContent('h1');
        if (adminTitle && adminTitle.includes('Love Insights')) {
            console.log('✅ "Love Insights" dashboard found.');
        } else {
            console.error(`❌ "Love Insights" NOT found. Found: ${adminTitle}`);
        }

        // Check for Stats Cards
        const stats = await page.$$('.backdrop-blur-xl');
        if (stats.length > 0) {
            console.log(`✅ Found ${stats.length} glassmorphism cards.`);
        }

        await page.screenshot({ path: 'admin_dashboard.png', fullPage: true });

        console.log('--- Verification Complete ---');

    } catch (error) {
        console.error('❌ Error:', error);
        await page.screenshot({ path: 'error_state.png', fullPage: true });
    } finally {
        await browser.close();
    }
})();
