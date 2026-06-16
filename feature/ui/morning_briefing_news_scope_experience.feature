@ui @ux @visual @playwright @tc-ux-briefing-news-scope-001
Feature: Morning Briefing news scope experience
  Morning Briefing must distinguish direct player news from market-context news.

  Background:
    Given the browser game starts from a clean local state
    And the player selected a Day 1 pre-open choice
    And the game uses the Playwright visual renderer

  Scenario: Review mixed Morning News scope before opening approval
    When the Morning Briefing screen is rendered with mixed news targets
    Then selected-sector news is labeled as sector impact
    And selected-asset news is labeled as direct impact
    And same-sector non-player asset news is labeled as contextual reference
    And the target text, market briefing, and opening approval remain visible
