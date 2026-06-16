import { expect, test } from "@playwright/test";
import { expectCanvasReady, resetBrowserState } from "./support/canvas";

test("run setup discovery guard visual baseline", async ({ page }) => {
  await resetBrowserState(page);

  await page.goto("/?renderer=canvas");

  const canvas = page.locator("canvas");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await expectCanvasReady(canvas);

  await page.mouse.click(232, 461);
  await page.waitForTimeout(100);
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot("run-setup-discovery-guard.png", {
    animations: "disabled",
    fullPage: true,
  });
});
