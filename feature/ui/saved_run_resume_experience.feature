@ui @ux @visual @playwright @tc-ux-menu-save-001
Feature: Saved Run Resume experience
  The Main Menu must make a resumable local Run understandable without overpowering new mode choices.

  Background:
    Given a valid current Run save exists in browser localStorage
    And the game uses the Playwright visual renderer

  Scenario: Review the saved Run before continuing
    When the Main Menu is rendered
    Then the saved-run badge indicates that a Run can be continued
    And the resume area shows mode, Day, resume entry point, fictional target, budget, profit, surveillance, and holding context
    And the continue control is visually grouped with the saved Run summary
    And Free Mode and Contract Mode remain visible as primary new-start choices
    And the screen preserves the fictional local-only safety framing
