@ui @ux @visual @playwright @tc-ux-contract-day-action-fit-001
Feature: Contract Day Settlement Action Fit experience
  Contract Mode Day Settlement must show how shared manual-action choices affected contract risk and efficiency.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Day Settlement from an active Contract Mode mandate
    And the game uses the Playwright visual renderer

  Scenario: Review cumulative tool fit impact after a Day close
    When the Day Settlement screen is rendered after mixed contract tool-fit results
    Then the contract progress panel shows objective progress
    And the panel shows cumulative tool-fit bonus and risk
    And the last tool-fit judgment remains visible when available
    And the Day result, risk metrics, next-step action, and fixed reward context remain visible
