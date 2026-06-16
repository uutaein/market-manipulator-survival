@ui @ux @visual @playwright @tc-ux-contract-day-001
Feature: Contract Day Settlement experience
  Contract Mode Day Settlement must show objective progress before the final settlement.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Day Settlement from an active Contract Mode mandate
    And the game uses the Playwright visual renderer

  Scenario: Review partial contract progress after a Day close
    When the Day Settlement screen is rendered for Contract Mode
    Then the Day result and risk metrics remain visible
    And the contract progress panel shows mandate status, target asset, current Day, and fixed reward
    And each contract objective shows pass, fail, or progress state
    And partial objective completion is visible before final reward settlement
    And the next-step action remains available
