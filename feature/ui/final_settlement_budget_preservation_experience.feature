@ui @ux @visual @playwright @tc-ux-final-budget-001
Feature: Final Settlement budget preservation experience
  Final Settlement must make Run-level budget preservation explicit.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Final Settlement with low remaining Run budget
    And the game uses the Playwright visual renderer

  Scenario: Review final budget preservation before replay
    When the Final Settlement screen is rendered
    Then final budget is shown with a preservation percentage
    And the preservation percentage is labeled against the Run starting budget
    And a below-threshold preservation state is called out
    And cumulative profit, success count, base grade, and replay choices remain visible
