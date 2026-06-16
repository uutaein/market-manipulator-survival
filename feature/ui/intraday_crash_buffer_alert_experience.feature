@ui @ux @visual @playwright @tc-ux-intraday-crash-001
Feature: Intraday crash buffer alert experience
  The live operation screen must warn the player when price approaches the crash line.

  Background:
    Given the browser game starts from a clean local state
    And the player approved opening for a Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Read the crash-line warning before forced failure
    When the Intraday operation screen is rendered near the crash line
    Then a crash alert is visible without opening settlement
    And the alert shows current change against the crash line
    And the alert shows the remaining crash buffer
    And the live price desk, risk telemetry, and manual actions remain visible
