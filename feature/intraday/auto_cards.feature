@mvp @intraday @auto-cards @feat-015
Feature: Auto cards and build rewards
  Auto cards provide periodic effects and simple Lv.1 to Lv.3 growth.

  Scenario: Start a Run with one auto card
    Given a new Run starts
    When initial Run state is created
    Then the player receives one random Lv.1 auto card from the 8 MVP auto cards

  Scenario: Offer auto card rewards during intraday operation
    Given intraday operation is active
    When an auto card reward timing is reached
    Then intraday operation pauses
    And up to 3 auto card choices are shown
    And the player can choose a new Lv.1 card or level up an owned card below Lv.3

  Scenario: Trigger periodic auto card effects
    Given the player owns an auto card
    When the card period is reached during intraday operation
    Then the card applies its configured state effect
    And the card effect uses abstract fictional stats only

  Scenario: Keep MVP auto cards simple
    Given the player owns auto cards
    Then no card can exceed Lv.3
    And card evolution is not available
    And card synergy is not available
    And rare or legendary card types are not available
