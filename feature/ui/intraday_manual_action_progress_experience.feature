@ui @ux @visual @playwright @tc-ux-action-progress-001
Feature: Intraday manual action progress experience
  Executing manual actions must clearly show progress and interruption behavior.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in Free Mode
    And a manual action is currently executing
    And the game uses the Playwright visual renderer

  Scenario: Understand an active manual action before interrupting it
    When the Intraday screen is rendered with an active manual action
    Then the executing action button shows progress and an interrupt label
    And the progress gauge is visibly filled for the active action
    And the action status explains that pressing the button again interrupts the remaining progress
    And non-active manual actions remain visually separate from the active action
    And money, risk, chart, and market context remain visible while the action executes
