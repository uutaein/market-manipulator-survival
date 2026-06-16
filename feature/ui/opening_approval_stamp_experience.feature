@ui @ux @visual @playwright @tc-ux-opening-stamp-001
Feature: Opening Approval stamp experience
  Opening Approval must feel like the final reviewed document action before Intraday starts.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches the Morning Briefing screen
    And the game uses the Playwright visual renderer

  Scenario: Review the opening approval stamp
    When the Morning Briefing screen is rendered
    Then the approval control is visually separated from briefing content
    And the control shows a stamp-like approval mark
    And the control confirms that review is complete before intraday operation
    And opening approval remains the primary next action
