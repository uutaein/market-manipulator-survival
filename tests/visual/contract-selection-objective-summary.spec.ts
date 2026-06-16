import { expect, test } from "@playwright/test";
import { expectCanvasReady, resetBrowserState } from "./support/canvas";

test("contract selection objective summary visual baseline", async ({
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

  await expect(page).toHaveScreenshot(
    "contract-selection-objective-summary.png",
    {
      animations: "disabled",
      fullPage: true,
    },
  );
});
