@ui @ux @visual @playwright @tc-ux-contract-track-action-fit-001
Feature: Contract Intraday Action Fit experience
  Contract Mode intraday play must make manual-action fit feedback obvious after a shared tool is used.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday from an active Contract Mode mandate
    And the game uses the Playwright visual renderer

  Scenario: Surface risky shared tool feedback in the contract tracker
    When the player uses a risky manual action for the active mandate
    Then the contract objective tracker is visible
    And the tracker shows a distinct tool-fit judgment line
    And the judgment explains the conflicting tool and mandate intent
    And objective status, estimated net performance, cost pressure, manual actions, market dashboard, and order book remain visible
