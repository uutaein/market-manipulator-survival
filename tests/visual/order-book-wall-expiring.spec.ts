import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  prepareOrderBookWallExpiringState,
  resetBrowserState,
} from "./support/canvas";

test("order-book wall expiring warning visual baseline", async ({ page }) => {
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

  await prepareOrderBookWallExpiringState(page);
  await page.waitForTimeout(1100);
  await expectCanvasReady(canvas);

  const expiringRow = page.locator(".mms-orderbook-row.wall-expiring");
  await expect(expiringRow).toBeVisible();
  await expect(expiringRow).toHaveAttribute("data-wall-time-tone", "expiring");
  await expect(expiringRow).toHaveAttribute("title", /만료 임박/);
  await expect(
    page.locator(".mms-orderbook-row.wall-expiring .mms-orderbook-action"),
  ).toContainText(/만료 \d+s/);
  await expect(page).toHaveScreenshot("order-book-wall-expiring.png", {
    animations: "disabled",
    fullPage: true,
  });
});
