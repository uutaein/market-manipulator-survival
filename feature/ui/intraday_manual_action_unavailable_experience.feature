@ui @ux @visual @playwright @tc-ux-action-unavailable-001
Feature: Intraday manual action unavailable experience
  Manual action controls must explain why unavailable actions cannot be used.

  Background:
    Given the browser game starts from a clean local state
    And the player approved opening for a Day 1 Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Read budget and cooldown blocked manual actions
    Given the Intraday state has low budget and one manual action on cooldown
    When the Intraday operation screen is rendered
    Then budget-cost actions that cannot be paid show an unavailable state
    And the cooldown action shows its remaining wait time
    And the manual action status line summarizes blocked reasons and available actions
    And an executing action would still remain interruptible in a separate active state
