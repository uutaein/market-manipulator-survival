@ui @ux @visual @playwright @tc-ux-final-failure-001
Feature: Run Failure Final Settlement experience
  Immediate Run failure must reuse Final Settlement while making the failure cause and snapshot unmistakable.

  Background:
    Given the player reaches an immediate failure condition during Intraday
    And the game uses the Playwright visual renderer

  Scenario: Review a forced failure result as a Final Settlement variant
    When the Final Settlement screen is rendered for forced failure
    Then the Final grade is shown as forced failure
    And the failure snapshot shows Day, current price change, surveillance, budget, and reason
    And Run performance, surveillance review, and risk panels remain visible
    And same-condition restart and new Run start remain available as separate actions
    And the screen stays within the Final Settlement layout instead of adding a separate failure screen
