import { expect, test } from "@playwright/test";
import { expectCanvasReady, prepareOrderBookWallState, resetBrowserState } from "./support/canvas";

test("order-book wall state visual baseline", async ({ page }) => {
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
  await expect(page.locator(".mms-orderbook-overlay")).toBeVisible();
  await expect(page.locator(".mms-orderbook-body.ask .mms-orderbook-row")).toHaveCount(5);
  await expect(page.locator(".mms-orderbook-body.bid .mms-orderbook-row")).toHaveCount(5);

  await prepareOrderBookWallState(page);
  await page.waitForTimeout(1100);
  await expectCanvasReady(canvas);

  await expect(page.locator(".mms-orderbook-row.wall-active")).toBeVisible();
  await expect(page.locator(".mms-orderbook-body.ask .mms-orderbook-row:not([hidden])")).toHaveCount(5);
  await expect(page.locator(".mms-orderbook-body.bid .mms-orderbook-row:not([hidden])")).toHaveCount(5);
  await expect(page).toHaveScreenshot("order-book-wall-state.png", {
    animations: "disabled",
    fullPage: true
  });
});
