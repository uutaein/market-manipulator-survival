@mvp @intraday @swarm @feat-017
Feature: Retail Swarm visualization
  Personal Participation is shown as both a number and an abstract visual swarm.

  Scenario: Reflect participation in swarm density
    Given intraday operation is active
    When personal participation increases
    Then the Retail Swarm becomes denser or faster
    And the participation number increases

  Scenario: Show overheated swarm state
    Given personal participation is high
    When the system evaluates Retail Swarm state
    Then the swarm can enter the overheated state
    And warning visuals are shown
    And surveillance or volatility risk can increase

  Scenario: Show panic swarm state
    Given personal participation reaches panic-risk conditions
    When panic is triggered
    Then the swarm shows a panic state
    And downward pressure or volatility risk increases
    And panic is represented with abstract tokens rather than realistic people
