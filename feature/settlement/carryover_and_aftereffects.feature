@mvp @settlement @carryover @feat-023
Feature: Day carryover and market aftereffects
  Day results affect later Days so the 5-Day Run feels connected.

  Scenario: Carry persistent Run state into the next Day
    Given a Day Settlement is complete
    When the next Day is prepared
    Then budget carries forward
    And cumulative profit carries forward
    And holding ratio carries forward
    And social cost carries forward
    And auto card levels carry forward

  Scenario: Partially carry risk state
    Given a Day Settlement is complete
    When the next Day is prepared
    Then surveillance partially carries forward
    And personal participation carries forward in reduced form
    And market liquidity mostly resets
    And volatility mostly resets with possible aftereffects

  Scenario: Apply weak market aftereffects
    Given the previous Day ended with overheat, panic, high surveillance, high profit, or excess holding
    When the next Day is prepared
    Then weak market aftereffects can adjust initial participation, volatility, surveillance, or competition pressure
    And those aftereffects are weaker than the new Morning News

  Scenario: Do not carry Pre-open Card effects
    Given a Day used a Pre-open Card
    When the next Day is prepared
    Then the Pre-open Card effect does not carry forward
