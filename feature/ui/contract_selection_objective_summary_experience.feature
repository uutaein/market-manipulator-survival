@ui @ux @visual @playwright @tc-ux-contract-select-objective-001
Feature: Contract Selection objective summary experience
  Contract cards must show objective shape before the player opens or accepts a mandate.

  Background:
    Given the browser game starts from a clean local state
    And the player opens Contract Mode selection
    And the game uses the Playwright visual renderer

  Scenario: Compare objective shapes across contract cards
    When the Contract Selection screen is rendered
    Then each visible contract card shows a concise objective summary
    And touch, band, defense, and VALUE/rank objectives are distinguishable from the card list
    And report confidence, reward, duration, risk, sponsor style, and target asset remain scannable
    And objective copy uses abstract game terms instead of real-world procedure language
