import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  prepareMarketBoardNewsBadgeState,
  resetBrowserState,
} from "./support/canvas";

test("market board news badges visual baseline", async ({ page }) => {
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

  await prepareMarketBoardNewsBadgeState(page);
  await page.waitForTimeout(1200);
  await expectCanvasReady(canvas);

  const marketTerminal = page.locator(".mms-market-terminal-overlay");
  await expect(marketTerminal).toBeVisible();
  await expect(
    marketTerminal.locator(".mms-market-name[data-news-label='섹터호재']"),
  ).not.toHaveCount(0);
  await expect(
    marketTerminal.locator(".mms-market-name[data-news-label='종목악재']"),
  ).not.toHaveCount(0);
  await expect(
    marketTerminal.locator(".mms-market-name[data-news-label='섹터악재']"),
  ).not.toHaveCount(0);

  await expect(page).toHaveScreenshot("market-board-news-badges.png", {
    animations: "disabled",
    fullPage: true,
  });
});
