@ui @ux @visual @playwright @tc-ux-wall-collapse-001
Feature: Order-book wall collapse feedback experience
  Collapsed fictional order-book walls must leave clear recent feedback without active-row state.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And a fictional order-book wall has collapsed after losing its remaining depth
    And the game uses the Playwright visual renderer

  Scenario: Review collapsed wall feedback
    When the Intraday order-book panel is rendered
    Then no active wall row indicator is shown
    And the recent wall feedback shows the collapsed wall and released barrier
    And the feedback shows zero remaining depth and zero refundable reserve
    And available wall actions remain embedded in order-book rows
