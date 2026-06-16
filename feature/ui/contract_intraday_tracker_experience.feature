@ui @ux @visual @playwright @tc-ux-contract-track-001
Feature: Contract Intraday Tracker experience
  Contract Mode intraday play must keep mandate progress and cost pressure visible.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday from an active Contract Mode mandate
    And the game uses the Playwright visual renderer

  Scenario: Track contract objective and cost pressure during intraday play
    When the Intraday screen is rendered for Contract Mode
    Then the contract objective tracker is visible
    And the tracker shows objective status, target progress, fixed reward, estimated net performance, and cost pressure
    And price objectives render a contract target line or band on the chart when practical
    And the tracker still leaves manual actions, market dashboard, and order book visible
