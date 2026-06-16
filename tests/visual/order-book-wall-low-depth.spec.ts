import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  prepareOrderBookWallLowDepthState,
  resetBrowserState,
} from "./support/canvas";

test("order-book wall low-depth warning visual baseline", async ({ page }) => {
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
  await expect(page.locator(".mms-orderbook-overlay")).toBeVisible();

  await prepareOrderBookWallLowDepthState(page);
  await page.waitForTimeout(1100);
  await expectCanvasReady(canvas);

  const lowDepthRow = page.locator(".mms-orderbook-row.wall-depth-low");
  await expect(lowDepthRow).toBeVisible();
  await expect(lowDepthRow).toHaveAttribute("data-wall-depth-tone", "low");
  await expect(lowDepthRow).toHaveAttribute("title", /잔량 낮음/);
  await expect(page).toHaveScreenshot("order-book-wall-low-depth.png", {
    animations: "disabled",
    fullPage: true,
  });
});
