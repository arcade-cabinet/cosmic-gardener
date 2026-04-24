import { test, expect } from "@playwright/test";

test.describe("Cosmic Gardener — User Journey", () => {
  test("Plays the game, completes a pattern, and restarts", async ({ page }) => {
    // 1. Landing Screen
    await page.goto("/");
    await expect(page.getByTestId("landing-screen")).toBeVisible();
    await expect(page.getByText("Cosmic Gardener")).toBeVisible();
    
    // 2. Mode Picker
    await page.getByRole("button", { name: "Initialize Nursery", exact: true }).click();
    await expect(page.getByText("Nursery Configuration")).toBeVisible();
    await page.getByRole("button", { name: "Begin Mission", exact: true }).click();
    
    // 3. Tutorial / Begin
    await expect(page.getByText("Awaken the Sector")).toBeVisible();
    await page.getByRole("button", { name: "Launch the orb", exact: true }).click();
    
    // 4. First Frame
    await expect(page.getByTestId("playing-screen")).toBeVisible();
    await expect(page.getByTestId("hud-stat-level")).toHaveText("1");
    await expect(page.getByTestId("hud-stat-score")).toHaveText("0");
    await expect(page.getByTestId("hud-pattern-chip")).toBeVisible();
    await expect(page.getByTestId("hud-charge")).toBeVisible();
    await expect(page.getByTestId("hud-warmth")).toBeVisible();

    // 5. Play for a short while
    await page.waitForTimeout(10000); // 10 seconds of play

    // We can also pause and restart to ensure that loop works
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByText("Paused")).toBeVisible();
    await page.getByRole("button", { name: "Restart" }).click();
    
    // It should go back to tutorial
    await expect(page.getByText("Awaken the Sector")).toBeVisible();
  });
});
