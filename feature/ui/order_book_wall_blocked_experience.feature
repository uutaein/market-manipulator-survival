@ui @ux @visual @playwright @tc-ux-wall-blocked-001
Feature: Order-book wall blocked and cooldown experience
  Unavailable fictional order-book wall actions must explain why they cannot start.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And an order-book wall level is on cooldown while budget is below wall reserve minimum
    And the game uses the Playwright visual renderer

  Scenario: Read blocked and cooldown wall state
    When the Intraday order-book panel is rendered
    Then the cooldown row shows a visible waiting state
    And row-level feedback explains that wall actions are blocked by budget or cooldown
    And no active remaining-depth indicator is shown for inactive rows
    And the wall interaction remains embedded in order-book rows without permanent extra buttons
