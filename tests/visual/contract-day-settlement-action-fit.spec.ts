import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  openDaySettlementScene,
  prepareContractDaySettlementActionFitState,
  resetBrowserState,
} from "./support/canvas";

test("contract day settlement action fit summary visual baseline", async ({
  page,
}) => {
  await resetBrowserState(page);

  await page.goto("/?renderer=canvas");

  const canvas = page.locator("canvas");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await expectCanvasReady(canvas);

  await page.mouse.click(820, 461);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await page.mouse.click(1018, 616);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await page.mouse.click(945, 326);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await page.mouse.click(190, 616);
  await page.waitForTimeout(1250);
  await expectCanvasReady(canvas);

  await page.mouse.click(1048, 620);
  await page.waitForTimeout(500);
  await expectCanvasReady(canvas);
  await expect(page.locator(".mms-price-chart-overlay")).toBeVisible();

  await prepareContractDaySettlementActionFitState(page);

  await openDaySettlementScene(page);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot(
    "contract-day-settlement-action-fit.png",
    {
      animations: "disabled",
      fullPage: true,
    },
  );
});
