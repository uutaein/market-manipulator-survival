@ui @ux @visual @playwright @tc-ux-wall-expiring-001
Feature: Order-book wall expiring experience
  Nearly expired fictional order-book walls must warn the player before the barrier times out.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And a fictional order-book wall is active with only a few seconds remaining
    And the game uses the Playwright visual renderer

  Scenario: Review an expiring active order-book wall
    When the Intraday order-book panel is rendered
    Then the active wall row shows an expiring visual tone
    And the active row label shows the remaining seconds with refundable reserve
    And the row title includes expiring, remaining time, remaining depth, and refundable reserve details
    And recent wall feedback still uses abstract depth, reserve, refund, and barrier terminology
    And inactive rows remain available without adding permanent wall buttons
