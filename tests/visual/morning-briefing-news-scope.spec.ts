import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  prepareMorningBriefingNewsScopeState,
  resetBrowserState,
} from "./support/canvas";

test("morning briefing news scope visual baseline", async ({ page }) => {
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

  await prepareMorningBriefingNewsScopeState(page);

  await page.mouse.click(190, 616);
  await page.waitForTimeout(1250);
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot("morning-briefing-news-scope.png", {
    animations: "disabled",
    fullPage: true,
  });
});
