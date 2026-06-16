@ui @ux @visual @playwright @tc-ux-market-board-context-001
Feature: Market Board context experience
  The Intraday Market Board must make its fictional context scope readable without real market terminology.

  Background:
    Given the browser game starts from a clean local state
    And the player approved opening for a Day 1 Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Read the Market Board scope labels
    When the Intraday operation screen is rendered
    Then the Market Board separates same-sector peer rows from other-sector average rows
    And the same-sector panel declares the two-peer scope
    And the other-sector panel declares the seven-average scope
    And the dashboard declares the player asset rank and selected chart scope
    And the dashboard exposes a compact selectable rank window
    And news-affected rows remain identifiable with abstract badges
