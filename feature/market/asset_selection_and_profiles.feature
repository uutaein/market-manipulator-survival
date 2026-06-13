@mvp @market @asset @feat-004 @feat-005
Feature: Asset selection and hidden profiles
  The MVP lets the player choose fictional assets while keeping detailed Run-specific tendencies hidden.

  Scenario: Select a fictional sector and asset
    Given the player starts a new Run
    When the Run Setup screen is shown
    Then all 8 fictional sectors are available
    And each sector has 3 fictional assets
    And the player can select one sector and one asset

  Scenario: Assign hidden asset tendencies per sector
    Given a new Run is created
    When Run-random asset profiles are generated
    Then each sector receives one stable tendency
    And each sector receives one standard tendency
    And each sector receives one high-risk tendency
    And these tendencies are assigned to the sector assets using the Run Seed

  Scenario: Hide detailed asset profile from the player at Run start
    Given the player is choosing an asset
    Then the player can see the asset name, sector, and short briefing
    But the player cannot see the hidden stable, standard, or high-risk tendency
    And the player cannot see full profile values before play
