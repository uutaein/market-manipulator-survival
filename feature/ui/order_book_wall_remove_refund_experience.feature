@ui @ux @visual @playwright @tc-ux-wall-remove-refund-001
Feature: Order-book wall removal refund experience
  Removing an active fictional order-book wall must show the refunded remaining reserve clearly.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And a fictional order-book wall was removed before its remaining depth was consumed
    And the game uses the Playwright visual renderer

  Scenario: Review removed wall refund feedback
    When the Intraday order-book panel is rendered
    Then no active wall row indicator is shown
    And the recent wall feedback shows the removed wall and released barrier
    And the feedback shows zero remaining depth and the refunded reserve
    And cooldown remains local to the removed price level
    And available wall actions remain embedded in order-book rows
