@mvp @intraday @documents @feat-016
Feature: Document events
  Document events connect bureaucratic decision pressure with intraday market pressure.

  Scenario: Trigger document events from intraday conditions
    Given intraday operation is active
    When a document event trigger condition is met
    And the global event limit allows another event
    Then one document event popup is shown
    And intraday operation pauses

  Scenario: Present three event choices
    Given a document event popup is shown
    Then the player sees three choices
    And the choices represent stable, aggressive, and avoid or watch directions

  Scenario: Apply the selected document event effect
    Given a document event popup is shown
    When the player selects a choice
    Then the selected effect is applied to abstract game stats
    And the document event closes
    And intraday operation resumes

  Scenario: Limit document event frequency
    Given document events have already occurred during the Day
    When the event system checks for another document event
    Then no more than 2 document events occur in one Day
    And document events respect the minimum gap between events
