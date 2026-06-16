@ui @ux @visual @playwright @tc-ux-menu-001
Feature: Main Menu experience
  The first screen must help the player choose a mode quickly without reading a checklist.

  Background:
    Given the browser game starts from a clean local state
    And the game uses the Playwright visual renderer

  Scenario: Choose between the two primary play modes
    When the Main Menu is rendered
    Then Free Mode is presented as a 5-Day Run option
    And Contract Mode is presented as a fixed-reward contract option
    And each primary mode has a visible start control
    And the saved-run status is visible without competing with the mode choices
    And the screen preserves the fictional local-only safety framing
