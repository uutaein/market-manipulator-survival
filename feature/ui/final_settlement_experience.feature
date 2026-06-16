@ui @ux @visual @playwright @tc-ux-final-settlement-001
Feature: Final Settlement experience
  The final settlement screen must summarize the whole Run and make replay choices clear.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Final Settlement from a completed Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Review the final grade before choosing the next Run
    When the Final Settlement screen is rendered
    Then the final grade and grade label are the primary visual focus
    And cumulative profit, successful Days, final budget, and budget preservation are visible as Run performance metrics
    And final surveillance grade, average surveillance grade, holding band, and social cost are visible as risk context
    And the local record save status is visible
    And same-condition restart and new Run start are both available as separate actions
