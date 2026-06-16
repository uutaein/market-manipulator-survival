@ui @ux @visual @playwright @tc-ux-day-settlement-budget-001
Feature: Day Settlement budget preservation experience
  Day Settlement must make remaining budget preservation explicit.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Day Settlement after spending most of the Run budget
    And the game uses the Playwright visual renderer

  Scenario: Review low budget preservation before the next Day
    When the Day Settlement screen is rendered
    Then remaining budget is shown with a preservation percentage
    And the preservation percentage is labeled against the Run starting budget
    And a below-threshold preservation state is called out
    And holding, participation, volatility, and social cost remain visible
