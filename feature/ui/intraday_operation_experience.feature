@ui @ux @visual @playwright @tc-ux-intraday-001
Feature: Intraday operation experience
  The live operation screen must keep price movement, risk state, market context, and actions scannable.

  Background:
    Given the browser game starts from a clean local state
    And the player approved opening for a Day 1 Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Read the initial live operation desk
    When the Intraday operation screen is rendered
    Then the current Day, selected asset, timer, and budget are visible as session status
    And the price chart and order book are visually grouped as the live price desk
    And target distance and crash buffer are visible near the live price desk
    And money and risk telemetry are grouped into compact snapshot cards before any manual action
    And raw internal metric labels are hidden from the main telemetry copy
    And high surveillance can surface as a compact alert without changing screens
    And near-crash price can surface as a compact alert without changing screens
    And the four MVP manual action controls are grouped together
    And the Market Board, selected-asset mini charts, and auto-card status are visible without hiding the primary action controls
