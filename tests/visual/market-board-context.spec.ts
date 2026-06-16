import { expect, test } from "@playwright/test";
import { expectCanvasReady, resetBrowserState } from "./support/canvas";

test("market board context visual baseline", async ({ page }) => {
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

  const marketTerminal = page.locator(".mms-market-terminal-overlay");
  await expect(marketTerminal).toBeVisible();
  await expect(marketTerminal.locator(".mms-terminal-scope")).toHaveText([
    "2 PEER / 동일 섹터",
    "7 AVG / 타 섹터",
    /ME #\d+\/24 \/ 선택 차트/,
  ]);
  await expect(
    marketTerminal.locator(
      ".mms-terminal-panel-compact .mms-terminal-body .mms-terminal-row",
    ),
  ).toHaveCount(2);
  await expect(
    marketTerminal.locator(
      ".mms-terminal-panel-normal .mms-terminal-body .mms-terminal-row",
    ),
  ).toHaveCount(7);
  await expect(
    marketTerminal.locator(
      ".mms-terminal-panel-ranked .mms-terminal-body .mms-terminal-row",
    ),
  ).toHaveCount(4);
  await expect(marketTerminal.locator(".mms-market-detail")).toBeVisible();

  await expect(page).toHaveScreenshot("market-board-context.png", {
    animations: "disabled",
    fullPage: true,
  });
});
