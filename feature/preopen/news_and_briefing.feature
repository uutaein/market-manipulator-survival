@mvp @preopen @news @feat-007 @feat-008
Feature: Morning News and Market Briefing
  Each Day generates fictional Morning News items and reveals them after the pre-open choice.

  Scenario: Generate three Morning News items per Day
    Given a new Day begins
    When Morning News is generated
    Then exactly three Morning News items are shown
    And one Morning News item targets a sector
    And two Morning News items target fictional assets
    And each Morning News item is generated from one of the five MVP news templates

  Scenario: Ignore non-player asset news for player pressure
    Given Morning News is generated
    When non-player asset news is evaluated for player pressure
    Then the non-player asset news does not change player asset pressure

  Scenario: Show briefing information before opening
    Given a Pre-open Card has been selected
    When the player views the Market Briefing
    Then the briefing summarizes the news effect
    And the briefing shows the target band
    And the briefing shows major risk hints without revealing hidden asset profile values
