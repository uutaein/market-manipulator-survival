@ui @ux @visual @playwright @tc-ux-intraday-dashboard-charts-001
Feature: Intraday dashboard selected asset charts experience
  The Intraday market dashboard must let the player inspect a selected fictional asset without leaving the live desk.

  Background:
    Given the browser game starts from a clean local state
    And the player approved opening for a Day 1 Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Inspect one dashboard asset with live and period charts
    When the Intraday operation screen is rendered
    And the player selects a row in the Market Dashboard
    Then the selected row is visually highlighted
    And the dashboard shows compact rank, move, news, and flow signals
    And the dashboard shows an individual live mini chart
    And the dashboard shows a Day-period mini chart with the current Day marker
    And the chart area remains inside the Market Board panel without hiding manual actions
