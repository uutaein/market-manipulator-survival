import { expect, test } from "@playwright/test";
import { expectCanvasReady, resetBrowserState } from "./support/canvas";

test("intraday dashboard selected asset charts visual baseline", async ({
  page,
}) => {
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
  const dashboardRows = marketTerminal.locator(
    ".mms-terminal-panel-ranked .mms-terminal-body .mms-terminal-row.selectable",
  );
  await expect(marketTerminal).toBeVisible();
  await expect(dashboardRows).toHaveCount(4);

  await dashboardRows.nth(1).click();
  await expect(dashboardRows.nth(1)).toHaveClass(/selected/);
  await expect(marketTerminal.locator(".mms-market-detail")).toBeVisible();
  await expect(marketTerminal.locator(".mms-market-live-line")).toHaveAttribute(
    "points",
    /,/,
  );
  await expect(
    marketTerminal.locator(".mms-market-period-line"),
  ).toHaveAttribute("points", /,/);
  await expect(
    marketTerminal.locator(".mms-market-period-days .current"),
  ).toHaveText(/D[1-5]/);
  await expect(marketTerminal.locator(".mms-market-detail-signal")).toHaveCount(
    4,
  );
  await expect(marketTerminal.locator(".mms-market-signal-rank")).toHaveText(
    /RANK #\d+/,
  );
  await expect(marketTerminal.locator(".mms-market-signal-move")).toHaveText(
    /MOVE/,
  );
  await expect(marketTerminal.locator(".mms-market-signal-news")).toHaveText(
    /뉴스|호재|악재/,
  );
  await expect(marketTerminal.locator(".mms-market-signal-flow")).toHaveText(
    /흐름 (상승|하락)/,
  );

  await expect(page).toHaveScreenshot("intraday-dashboard-asset-charts.png", {
    animations: "disabled",
    fullPage: true,
  });
});
