@ui @ux @visual @playwright @tc-ux-preopen-001
Feature: Pre-open Card experience
  The pre-open screen must make the locked news state and one-card decision clear before Morning News.

  Background:
    Given the browser game starts from a clean local state
    And the player starts a new Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Make the Day 1 pre-open decision before Morning News
    When the Pre-open Card screen is rendered for Day 1
    Then Morning News is visibly locked until a pre-open choice is made
    And early positioning is the only active Day 1 choice
    And the early positioning ratio, budget use, threshold marker, and concentration risk are visible together
    And the decision impact panel summarizes ratio, remaining budget, and risk before confirmation
    And unavailable pre-open cards are shown as locked future choices
    And the next-step control explains that the player must choose before reading Morning News
