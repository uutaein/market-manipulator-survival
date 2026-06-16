@ui @ux @visual @playwright @tc-ux-menu-record-001
Feature: Local Record Snapshot experience
  The Main Menu must surface recent and best local records when no active Run is waiting to continue.

  Background:
    Given browser localStorage contains recent Final Settlement and best-record envelopes
    And no active current Run save exists
    And the game uses the Playwright visual renderer

  Scenario: Review local results before starting another Run
    When the Main Menu is rendered
    Then the local record area shows the recent Final grade and cumulative performance
    And the recent result includes successful Day and risk context
    And the best record summary shows best grade, best cumulative profit, and final surveillance
    And Free Mode and Contract Mode remain visible as primary new-start choices
    And the screen preserves the fictional local-only safety framing
