Feature: Contract Mode
  Contract Mode is a post-MVP mode where the player accepts a fixed-reward
  mandate and satisfies fictional price, band, VALUE, or rank conditions over a
  limited 1~5 Day period.

  Background:
    Given the MVP baseline is available as free mode

  Scenario: Player can choose Contract Mode without changing Free Mode
    When the player opens the mode selection menu
    Then free mode is available
    And contract mode is available
    When the player starts free mode
    Then the run uses the MVP 5-Day free mode loop
    When the player starts contract mode
    Then the player is routed to contract selection

  Scenario: Contract selection offers the first playable contract slice
    Given contract mode is selected
    When contract options are generated
    Then at least 4 contract options are shown
    And an upward touch contract is available
    And a downward touch contract is available
    And a band maintain contract is available
    And a defense contract is available
    And each contract shows a fixed reward, risk level, duration, target asset, and objective summary

  Scenario: Contract briefing exposes objectives and expert report
    Given contract mode is selected
    And the player accepts an upward touch contract
    When the contract briefing is shown
    Then the briefing shows the target asset
    And the briefing shows the contract duration
    And the briefing shows the objective summary
    And the briefing shows the fixed reward
    And the briefing shows an expert report
    And the expert report does not reveal the exact objective as a mechanical instruction

  Scenario: Upward touch objective is completed during the contract period
    Given the player accepted an upward touch contract
    When the tracked asset touches the contract target before the deadline
    Then the touch objective is marked completed
    And the contract remains eligible for fixed reward

  Scenario: Downward touch objective is completed during the contract period
    Given the player accepted a downward touch contract
    When the tracked asset touches the lower contract target before the deadline
    Then the touch objective is marked completed
    And the contract remains eligible for fixed reward

  Scenario: Band maintain objective counts maintained Days
    Given the player accepted a band maintain contract requiring 3 maintained Days
    When the tracked asset closes inside the contract band for 2 Days
    Then the maintain objective progress is 2 of 3 Days
    And the contract is not yet successful
    When the tracked asset closes inside the contract band for the required Day
    Then the maintain objective is marked completed

  Scenario: Defense objective fails permanently after a forbidden break
    Given the player accepted a defense contract with a lower break line
    When the tracked asset breaks below the forbidden lower line during the contract period
    Then the defense objective is marked failed
    And the defense objective remains failed even if the price later recovers

  Scenario: Market dashboard objectives use VALUE and rank observations
    Given the player accepted a contract with VALUE and rank objectives
    When the tracked asset reaches the required cumulative VALUE
    And the tracked asset reaches the required dashboard rank
    Then the VALUE objective is marked completed
    And the rank objective is marked completed

  Scenario: Downward contracts create counter-pressure risk
    Given the player accepted a downward touch contract
    When the player forces a rapid drop with high VALUE and high MADNESS
    Then rebound demand risk increases
    And the contract net performance is penalized for excessive side effects

  Scenario: Successful contract settlement pays fixed reward and grades efficiency
    Given the player accepted a contract with multiple required objectives
    When every required objective is completed by the contract deadline
    Then the contract is successful
    And the fixed reward is paid
    And contract settlement shows budget spent, surveillance cost, social cost, side-effect penalties, and net performance
    And contract settlement shows an efficiency grade

  Scenario: Failed contract settlement does not pay fixed reward in the first implementation
    Given the player accepted a contract with multiple required objectives
    When at least one required objective is not completed by the contract deadline
    Then the contract is failed
    And the fixed reward is not paid
    And partial objective progress is shown for feedback
