@ui @ux @visual @playwright @tc-ux-intraday-objective-001
Feature: Intraday objective distance experience
  The live operation screen must make the target band and crash-line distance readable while the player watches the chart.

  Background:
    Given the browser game starts from a clean local state
    And the player approved opening for a Day 1 Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Read target and crash distance from the live price desk
    When the Intraday operation screen is rendered
    Then the live price desk separates current price movement from objective distance
    And the target-band distance is visible without opening another panel
    And the crash-line buffer is visible without replacing the chart or order book
    And the wording uses abstract game-state language rather than real-market procedure detail
