@ui @ux @visual @playwright @tc-ux-day-settlement-hold-001
Feature: Day Settlement high-holding risk experience
  Day Settlement must make excessive remaining holding risk understandable.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Day Settlement with excessive remaining holding
    And the game uses the Playwright visual renderer

  Scenario: Review excessive holding settlement risk
    When the Day Settlement screen is rendered
    Then the holding band is shown as a settlement risk state
    And the screen explains that high holding can worsen surveillance and final scoring
    And the next-play hint points to position clearing as the risk-control action
    And social cost and supporting risk metrics remain visible
