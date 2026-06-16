@ui @ux @visual @playwright @tc-ux-wall-state-001
Feature: Order-book wall state experience
  Active fictional order-book walls must show row state and recent feedback clearly.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And a fictional order-book wall is active with partial remaining depth
    And the game uses the Playwright visual renderer

  Scenario: Review an active order-book wall
    When the Intraday order-book panel is rendered
    Then the active wall row shows a visible remaining-depth indicator
    And the active row shows concise remove/refund state without requiring hover
    And recent wall feedback is visible near the action/status area
    And the feedback uses abstract depth, reserve, refund, and barrier terminology
    And inactive rows remain available without adding permanent wall buttons
