const { test, expect } = require('@playwright/test');

test('Admin Dashboard should be accessible with Admin role', async ({ page }) => {
  await page.goto('http://localhost:19006/admin');

  // Set auth session in localStorage for the web build
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'dummy-admin-token');
    localStorage.setItem('auth_user', JSON.stringify({
      id: 'admin-id',
      email: 'admin@test.com',
      role: 'Admin',
      firstName: 'Admin',
      lastName: 'User'
    }));
  });

  // Reload or navigate again to apply the session
  await page.goto('http://localhost:19006/admin');

  // Wait for the dashboard content
  await page.waitForTimeout(5000);

  // Check for sidebar title or dashboard header
  const sidebarTitle = page.locator('text=Revive Egypt Admin');
  await expect(sidebarTitle).toBeVisible({ timeout: 15000 });

  await page.screenshot({ path: 'verification/screenshots/admin_dashboard_auth.png' });

  // Check some menu items
  await expect(page.locator('text=Users')).toBeVisible();
  await expect(page.locator('text=Museums')).toBeVisible();
});
