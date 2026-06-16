import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  prepareIntradayRepositionDeskState,
  resetBrowserState,
} from "./support/canvas";

async function reachIntraday(
  page: Parameters<typeof prepareIntradayRepositionDeskState>[0],
) {
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

  return canvas;
}

test("intraday zero-holding reposition prompt visual baseline", async ({
  page,
}) => {
  const canvas = await reachIntraday(page);

  await prepareIntradayRepositionDeskState(page);
  await page.waitForTimeout(1200);
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot(
    "intraday-zero-holding-reposition-prompt.png",
    {
      animations: "disabled",
      fullPage: true,
    },
  );
});

test("intraday reposition desk visual baseline", async ({ page }) => {
  const canvas = await reachIntraday(page);

  await prepareIntradayRepositionDeskState(page);
  await page.waitForTimeout(1200);
  await expectCanvasReady(canvas);

  await page.mouse.click(900, 612);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot("intraday-reposition-desk.png", {
    animations: "disabled",
    fullPage: true,
  });
});
