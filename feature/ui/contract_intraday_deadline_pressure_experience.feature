@ui @ux @visual @playwright @tc-ux-contract-track-deadline-001
Feature: Contract Intraday Deadline Pressure experience
  Contract Mode intraday play must make urgent objective deadlines readable at a glance.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday from an active Contract Mode mandate
    And the game uses the Playwright visual renderer

  Scenario: Show today deadline pressure inside the contract tracker
    When the Intraday screen is rendered on the final objective day
    Then the contract objective tracker is visible
    And the tracker headline shows that the pending objective is due today
    And objective status, target line, estimated net performance, and cost pressure remain visible
    And the tracker still leaves manual actions, market dashboard, and order book visible
