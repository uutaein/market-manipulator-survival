@ui @ux @visual @playwright @tc-ux-market-news-badges-001
Feature: Market Board news badge experience
  News-affected Market Board rows must make the affected scope and tone easy to identify.

  Background:
    Given the browser game starts from a clean local state
    And the player approved opening for a Day 1 Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Read positive and negative news badges in Market Board rows
    Given Market Board rows include selected-sector, same-sector asset, and other-sector news effects
    When the Intraday operation screen is rendered
    Then sector-positive rows show a compact positive news badge
    And asset-negative rows show a compact negative news badge
    And sector-negative rows show a compact negative news badge
    And the badges remain abstract without real ticker, venue, or exchange terminology
