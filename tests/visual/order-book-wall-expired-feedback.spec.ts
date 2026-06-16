import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  prepareOrderBookWallExpiredState,
  resetBrowserState,
} from "./support/canvas";

test("order-book wall expired feedback visual baseline", async ({ page }) => {
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

  await prepareOrderBookWallExpiredState(page);
  await page.waitForTimeout(1100);
  await expectCanvasReady(canvas);

  const expiredRow = page.locator(".mms-orderbook-row.wall-expired-recent");
  await expect(expiredRow).toBeVisible();
  await expect(expiredRow).toHaveAttribute("data-wall-outcome-tone", "expired");
  await expect(expiredRow).toHaveAttribute("title", /최근 만료/);
  await expect(
    page.locator(
      ".mms-orderbook-row.wall-expired-recent .mms-orderbook-action",
    ),
  ).toContainText(/만료 환급/);
  await expect(page.locator(".mms-orderbook-row.wall-active")).toHaveCount(0);
  await expect(page).toHaveScreenshot("order-book-wall-expired-feedback.png", {
    animations: "disabled",
    fullPage: true,
  });
});
