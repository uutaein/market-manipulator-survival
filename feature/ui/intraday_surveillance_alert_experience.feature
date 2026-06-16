@ui @ux @visual @playwright @tc-ux-intraday-surveillance-001
Feature: Intraday surveillance alert experience
  The live operation screen must warn the player before surveillance reaches the forced-failure line.

  Background:
    Given the browser game starts from a clean local state
    And the player approved opening for a Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Read the high-surveillance warning before forced failure
    When the Intraday operation screen is rendered with high surveillance
    Then a surveillance alert is visible without opening settlement
    And the alert shows the current surveillance grade band
    And the alert shows the remaining buffer before the failure line
    And the live price desk, risk telemetry, and manual actions remain visible
