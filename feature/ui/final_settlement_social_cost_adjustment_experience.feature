@ui @ux @visual @playwright @tc-ux-final-social-cost-001
Feature: Final Settlement social cost adjustment experience
  Final Settlement must explain when social cost lowers the final grade.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Final Settlement with high social cost
    And the game uses the Playwright visual renderer

  Scenario: Review social cost grade adjustment
    When the Final Settlement screen is rendered
    Then the final grade remains the primary visual focus
    And the performance panel shows the base grade before adjustment
    And the settlement risks panel shows the final grade adjustment
    And the adjustment reason names high social cost as the cause
    And replay choices remain visible
