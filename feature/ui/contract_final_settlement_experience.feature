@ui @ux @visual @playwright @tc-ux-contract-final-001
Feature: Contract Final Settlement experience
  The contract final settlement screen must make mandate outcome, costs, and efficiency clear.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Final Settlement from a completed Contract Mode mandate
    And the game uses the Playwright visual renderer

  Scenario: Review contract result and cost breakdown
    When the Final Settlement screen is rendered for Contract Mode
    Then contract success or failure is visible as a primary result
    And objective completion is shown per contract objective
    And fixed reward, spent budget, surveillance cost, social cost, side-effect penalty, and missed-objective penalty are visible
    And net performance and efficiency grade are visible separately from the binary contract result
    And same-condition restart and new Run start remain available as separate actions
