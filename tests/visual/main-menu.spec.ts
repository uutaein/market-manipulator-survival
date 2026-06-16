import { expect, test } from "@playwright/test";
import {
  expectCanvasReady,
  resetBrowserState,
  seedLocalRecordSnapshotState,
  seedSavedRunResumeState,
} from "./support/canvas";

test("main menu visual baseline", async ({ page }) => {
  await resetBrowserState(page);

  await page.goto("/?renderer=canvas");

  const canvas = page.locator("canvas");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot("main-menu.png", {
    animations: "disabled",
    fullPage: true,
  });
});

test("main menu saved run resume visual baseline", async ({ page }) => {
  await seedSavedRunResumeState(page);

  await page.goto("/?renderer=canvas");

  const canvas = page.locator("canvas");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot("main-menu-saved-run.png", {
    animations: "disabled",
    fullPage: true,
  });
});

test("main menu local record snapshot visual baseline", async ({ page }) => {
  await seedLocalRecordSnapshotState(page);

  await page.goto("/?renderer=canvas");

  const canvas = page.locator("canvas");
  await page.waitForFunction(() => document.fonts.status === "loaded");
  await expectCanvasReady(canvas);

  await expect(page).toHaveScreenshot("main-menu-local-records.png", {
    animations: "disabled",
    fullPage: true,
  });
});
