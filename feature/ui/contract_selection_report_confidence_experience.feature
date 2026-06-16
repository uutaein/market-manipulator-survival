@ui @ux @visual @playwright @tc-ux-contract-select-confidence-001
Feature: Contract Selection report confidence experience
  Contract cards must expose report confidence before the player accepts a mandate.

  Background:
    Given the browser game starts from a clean local state
    And the player opens Contract Mode selection
    And the game uses the Playwright visual renderer

  Scenario: Compare report confidence across contract cards
    When the Contract Selection screen is rendered
    Then each visible contract card shows a report confidence badge
    And the selected contract detail still shows report confidence in context
    And reward, duration, risk, sponsor style, and target asset remain scannable
    And confidence copy stays abstract and does not imply real-world investment advice
