import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = await context.new_page()

        # Go to a page that triggers the language load
        await page.goto('http://localhost:8081/admin')

        # Injected script to set localStorage
        inject_script = """
        () => {
            localStorage.setItem('auth_token', 'mock-admin-token');
            localStorage.setItem('auth_user', JSON.stringify({
                id: 'admin123',
                name: 'Admin User',
                email: 'admin@reviveegypt.com',
                role: 'Admin'
            }));
            localStorage.setItem('user-language', 'ar');
        }
        """
        await page.evaluate(inject_script)
        await page.reload()

        # Wait for the dashboard to render (sidebar title might be translated)
        # Using a more robust wait
        await asyncio.sleep(5)

        # Take screenshot of RTL Admin Panel
        os.makedirs('/home/jules/verification/screenshots', exist_ok=True)
        await page.screenshot(path='/home/jules/verification/screenshots/admin_rtl_ar.png')

        print("RTL screenshot captured: admin_rtl_ar.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
