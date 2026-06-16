@ui @ux @visual @playwright @tc-ux-briefing-preopen-001
Feature: Morning Briefing pre-open effect experience
  Opening approval must show the selected pre-open effect before intraday starts.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches a carried-position Day
    And the player selected a directional pre-open card
    And the game uses the Playwright visual renderer

  Scenario: Review pre-open effect before opening approval
    When the Morning Briefing screen is rendered after a news assignment choice
    Then the selected pre-open card is summarized before approval
    And the assigned news direction is visible in the Morning News feed
    And the pre-open budget and risk effect direction are visible
    And Today Condition remains visible beside the effect summary
    And Opening Approval remains the final action into intraday operation
