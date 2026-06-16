@ui @ux @visual @playwright @tc-ux-briefing-001
Feature: Morning Briefing experience
  The briefing screen must turn the revealed news into a clear opening decision.

  Background:
    Given the browser game starts from a clean local state
    And the player selected a Day 1 pre-open choice
    And the game uses the Playwright visual renderer

  Scenario: Review Morning News before approving the opening
    When the Morning Briefing screen is rendered
    Then exactly three Morning News items are visible as a grouped feed
    And player-impacting and contextual news scopes are visually distinguishable
    And the selected asset briefing shows target band and crash line context
    And the selected pre-open effect is summarized before approval
    And Today Condition and risk hints are visible before opening
    And Opening Approval is visually separated as the final action
