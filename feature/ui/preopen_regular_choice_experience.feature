@ui @ux @visual @playwright @tc-ux-preopen-regular-001
Feature: Regular Pre-open Card choice experience
  A carried-position Day must let the player compare all pre-open choices before Morning News.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches the next Day with a carried position
    And the game uses the Playwright visual renderer

  Scenario: Compare regular pre-open choices before Morning News
    When the Pre-open Card screen is rendered for a carried-position Day
    Then all four pre-open card choices are available
    And the screen shows that only one card can be selected
    And budget-cost choices are comparable against the current budget
    And the watch choice is visible as the no-cost path to Morning News
    And the next-step control keeps Morning News locked until a choice or watch path is confirmed
