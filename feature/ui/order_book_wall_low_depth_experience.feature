@ui @ux @visual @playwright @tc-ux-wall-low-depth-001
Feature: Order-book wall low-depth experience
  Nearly consumed fictional order-book walls must warn the player before the barrier collapses.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And a fictional order-book wall is active with low remaining depth
    And the game uses the Playwright visual renderer

  Scenario: Review a low-depth active order-book wall
    When the Intraday order-book panel is rendered
    Then the active wall row shows a low-depth visual tone
    And the active row label shows the remaining-depth percentage with refundable reserve
    And the row title includes low-depth, remaining depth, and refundable reserve details
    And recent wall feedback still uses abstract depth, reserve, refund, and barrier terminology
    And inactive rows remain available without adding permanent wall buttons
