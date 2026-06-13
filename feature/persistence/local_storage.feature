@mvp @persistence @feat-006 @feat-026
Feature: Local persistence and restart records
  The MVP stores only the minimum local state required for current Run resume and replay learning.

  Scenario: Save current Run locally
    Given the player has an active Run
    When the game saves progress
    Then the current Run state is stored under the MVP localStorage key
    And the save includes a schema version
    And no cloud account data is stored

  Scenario: Continue a saved Run from Main Menu
    Given a valid current Run save exists
    When the player opens the Main Menu
    Then the player can continue the saved Run

  Scenario: Store recent and best results
    Given the player reaches Final Settlement
    When the final result is saved
    Then the recent Final Settlement is stored locally
    And the best Final grade and best cumulative profit can be updated

  Scenario: Discard incompatible saves in MVP
    Given a saved object has an incompatible schema version
    When the game attempts to load it
    Then the incompatible save may be discarded
    And the player can start a new Run
