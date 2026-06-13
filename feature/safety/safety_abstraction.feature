@mvp @safety @feat-027
Feature: Safety abstraction layer
  The MVP must remain fictional, satirical, and abstract.

  Scenario: Avoid real market entities
    Given any player-facing content is shown
    Then it must not include real company names
    And it must not include real stock or ticker names
    And it must not include real exchange names
    And it must not include real market data
    And it must not include real news

  Scenario: Use safe player-facing terminology
    Given a player-facing action, card, stat, document, or hint is shown
    Then it uses approved safe abstraction terms
    And it avoids direct real-world financial-crime procedure language

  Scenario: Keep the simulation fictional
    Given the game calculates price, participation, surveillance, or profit
    Then the calculation uses fictional game stats
    And the calculation does not claim to model real markets
    And the calculation does not require real market data
