@ui @ux @visual @playwright @tc-ux-reposition-001
Feature: Intraday desk reposition experience
  A fully settled position must expose a clear fictional re-entry decision before the Day ends.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in Free Mode
    And the player has reduced the current holding to zero
    And the game uses the Playwright visual renderer

  Scenario: See re-entry options from the zero-holding intraday desk
    When the Intraday screen is rendered with zero holding and no active manual action
    Then manual action buttons are visibly unavailable as watch-state controls
    And the desk reposition control is visible as the re-entry path
    And timed Day Settlement remains the end-Day path
    And the action status explains that the player can reposition

  Scenario: Choose a new fictional asset from the intraday reposition desk
    When the Intraday Reposition screen is rendered
    Then the screen shows the re-entry eligibility conditions
    And the sector and asset choices are visibly separated
    And the selected asset brief shows role, baseline value, and news sensitivity
    And the re-entry cost, starting holding, and preserved risk state are visible
    And the player can return to intraday operation without changing assets
