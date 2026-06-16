@ui @ux @visual @playwright @tc-ux-contract-001
Feature: Contract Selection experience
  Contract Mode must make reward, risk, and objective shape comparable before acceptance.

  Background:
    Given the browser game starts from a clean local state
    And the player chooses Contract Mode from the Main Menu
    And the game uses the Playwright visual renderer

  Scenario: Compare available contracts before accepting one
    When the Contract Selection screen is rendered
    Then available contracts are displayed as comparable choices
    And the selected contract summary is visually prominent
    And each contract card shows a concise objective summary
    And reward, duration, risk, sponsor type, and report confidence are visible before acceptance
    And the expert report hint is grouped with the selected objective context
    And accept and return controls are visually separated by intent
