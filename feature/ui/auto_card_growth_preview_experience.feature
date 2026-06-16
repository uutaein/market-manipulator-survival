@ui @ux @visual @playwright @tc-ux-auto-growth-001
Feature: Auto Card Growth Preview experience
  Auto card reward choices must show what changes when a card is newly acquired or leveled up.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And an Auto Card Reward popup is open
    And the game uses the Playwright visual renderer

  Scenario: Compare current and next auto card growth values
    When the Auto Card Reward popup is rendered with mixed growth choices
    Then level-up choices show current level to next level
    And period-growth cards show current trigger period to next trigger period
    And effect-growth cards show current effect scale to next effect scale
    And new-card choices show their starting level, period, and growth type
    And no choice implies non-MVP evolution, rarity, or synergy
