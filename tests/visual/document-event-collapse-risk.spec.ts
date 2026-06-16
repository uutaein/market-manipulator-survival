import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  prepareCollapseRiskDocumentEventState,
  resetBrowserState,
} from "./support/canvas";

test("document event collapse risk visual baseline", async ({ page }) => {
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

  await prepareCollapseRiskDocumentEventState(page);
  await page.waitForTimeout(1100);
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot("document-event-collapse-risk.png", {
    animations: "disabled",
    fullPage: true,
  });
});
