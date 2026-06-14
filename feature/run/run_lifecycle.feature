@mvp @run @feat-001 @feat-002 @feat-003 @feat-006 @feat-025
Feature: Run lifecycle
  The MVP must support a complete 5-Day Run from setup to Final Settlement or forced failure.

  Background:
    Given the accepted MVP SPEC is used
    And the game uses only fictional assets and abstract market-pressure stats

  Scenario: Start a new 5-Day Run
    Given the player is on the Main Menu
    When the player starts a new Run
    Then the Run starts at Day 1
    And the Run has an internal Run Seed
    And the Run status is active

  Scenario: Progress through the required Day phases
    Given the player is in an active Run
    When a Day begins
    Then the player can choose a Pre-open Card
    When the pre-open choice is confirmed
    Then the player sees Morning News
    And the player sees the Market Briefing
    And the player must perform Opening Approval before intraday operation starts
    And the Day ends with Day Settlement after intraday operation

  Scenario: Reach Final Settlement after Day 5
    Given the player completes Day 5 without forced failure
    When Day 5 Settlement is completed
    Then the Final Settlement screen is shown
    And the Run status is completed

  Scenario: Trigger immediate Run failure
    Given the player is in intraday operation
    When any immediate failure condition is met
    Then the Run failure result is shown as a Final Settlement variant
    And the final grade is F
    And the player can choose same-condition restart or new Run

  Scenario: Restart with the same Run Seed
    Given the player has reached Run failure or Final Settlement
    When the player chooses same-condition restart
    Then the new attempt uses the same Run Seed
    And initial Run-random conditions are reproduced
    And the player can try different decisions

  Scenario: Start the next Day with fresh intraday price change
    Given the player finished an intraday Day at a large positive change
    When the next Day intraday operation starts
    Then the player price change starts at 0 percent
    And the first chart history point starts at 0 percent
    And the next Day opening price uses the previous close

  Scenario: Carry average entry into the next Day without additional accumulation
    Given the player finished a Day with a carried position average entry
    When the next Day intraday operation starts without additional accumulation
    Then the player average entry stays unchanged

  Scenario: Keep total profit coherent after Day 2 asset analysis
    Given the player ended Day 1 around 20 percent up with a carried position
    When Day 2 starts after selecting asset analysis
    Then the Day 2 opening price uses the Day 1 close
    And the intraday total profit only changes by the asset analysis cost
