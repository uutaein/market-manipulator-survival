@ui @ux @visual @playwright @tc-ux-auto-reward-001
Feature: Auto Card Reward popup experience
  Auto card reward popups must pause intraday operation and make build choices comparable.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And an Auto Card Reward popup is open
    And the game uses the Playwright visual renderer

  Scenario: Choose a new card or level-up reward
    When the Auto Card Reward popup is rendered
    Then the paused reward state is visible above the intraday screen
    And up to three card choices are visually separated
    And each choice shows whether it is a new card or level-up
    And each choice shows next level, trigger period, growth type, and abstract stat effect
    And the popup communicates the MVP Lv.3 cap without implying evolution or synergy
