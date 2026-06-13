@mvp @run @onboarding @feat-024
Feature: Day 1 integrated onboarding
  The MVP teaches the core loop through Day 1 instead of using a separate tutorial mode.

  Scenario: Experience the core Day 1 loop
    Given the player starts Day 1
    When the Day begins
    Then the player reads Morning News
    And the player reviews the Market Briefing
    And the player chooses one Pre-open Card or "관망"
    And the player approves the opening
    And the player can use all four manual actions during intraday operation
    And the player sees Day Settlement feedback

  Scenario: Avoid high-risk event chains on Day 1
    Given the player is playing Day 1
    When document events are evaluated
    Then the system avoids high-risk event chains before the core loop is introduced
    And at most one low-risk onboarding document event is strongly favored

  Scenario: Show a learning hint at Day 1 Settlement
    Given the player reaches Day 1 Settlement
    When the Day result is displayed
    Then a short hint explains one useful next decision
    And the hint does not introduce real-world market procedures
