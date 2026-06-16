@ui @ux @visual @playwright @tc-ux-day-settlement-001
Feature: Day Settlement experience
  The settlement screen must explain the Day result and the next decision path.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Day Settlement from a Day 1 Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Review the Day result before continuing
    When the Day Settlement screen is rendered
    Then actual profit and surveillance grade are visible as the primary result axes
    And budget preservation, holding, participation, volatility, and social cost are visible as supporting metrics
    And holding-band risk is shown in the result context
    And a short next-play hint is visible
    And the next-step control is visually separated from the result summary
