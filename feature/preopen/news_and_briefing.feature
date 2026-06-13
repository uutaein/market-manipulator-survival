@mvp @preopen @news @feat-007 @feat-008
Feature: Morning News and Market Briefing
  Each Day begins with one fictional Morning News item and a short Market Briefing.

  Scenario: Generate one Morning News item per Day
    Given a new Day begins
    When Morning News is generated
    Then exactly one Morning News item is shown
    And it is generated from one of the five MVP news templates
    And it has a fictional target

  Scenario: Use sector-level targeting as MVP default
    Given Morning News is generated
    When the target type is selected
    Then sector-level targeting is preferred for MVP
    And market-level or asset-level targeting may only appear within the accepted SPEC scope

  Scenario: Show briefing information before opening
    Given Morning News has been shown
    When the player views the Market Briefing
    Then the briefing summarizes the news effect
    And the briefing shows the target band
    And the briefing shows major risk hints without revealing hidden asset profile values
