import { expect, test } from "@playwright/test";
import { expectCanvasReady, resetBrowserState } from "./support/canvas";

test("intraday operation visual baseline", async ({ page }) => {
  await resetBrowserState(page);

  await page.goto("/?renderer=canvas");

  const canvas = page.locator("canvas");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await expectCanvasReady(canvas);

  await page.mouse.click(232, 461);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await page.mouse.click(878, 559);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await page.mouse.click(150, 242);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await page.mouse.click(190, 616);
  await page.waitForTimeout(1250);
  await expectCanvasReady(canvas);

  await page.mouse.click(1048, 620);
  await page.waitForTimeout(500);
  await expectCanvasReady(canvas);
  await expect(page.locator(".mms-price-chart-overlay")).toBeVisible();
  await expect(page.locator(".mms-telemetry-overlay")).toBeVisible();
  await expect(page.locator(".mms-telemetry-card")).toHaveCount(4);
  await expect(page.locator(".mms-telemetry-status")).toHaveCount(3);
  await expect(page.locator(".mms-market-terminal-overlay")).toBeVisible();

  await expect(page).toHaveScreenshot("intraday-operation.png", {
    animations: "disabled",
    fullPage: true
  });
});
