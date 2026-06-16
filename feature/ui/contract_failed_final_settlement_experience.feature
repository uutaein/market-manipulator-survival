@ui @ux @visual @playwright @tc-ux-contract-final-fail-001
Feature: Contract Failed Final Settlement experience
  A failed contract settlement must make missed objectives and withheld reward unmistakable.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Final Settlement from a failed Contract Mode mandate
    And the game uses the Playwright visual renderer

  Scenario: Review a failed contract outcome and cost breakdown
    When the Final Settlement screen is rendered for a failed Contract Mode mandate
    Then contract failure is visible as the primary contract result
    And each missed objective is shown with failed progress
    And the fixed reward is shown as unpaid
    And missed-objective penalty and other risk costs are visible
    And net performance and efficiency grade show the cost of failure separately from Free Mode final grade
