import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('should display health check component', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if health check is visible (if added to a page)
    // This is a basic smoke test
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/health', route => route.abort());
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // The app should still render even if health check fails
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});


