@mvp @market @board @feat-018
Feature: Market Board display
  The MVP Market Board shows the player asset, same-sector competitors, other-sector averages, and a fictional value ranking.

  Scenario: Display the market terminal rows
    Given intraday operation has started
    When the Market Board is shown
    Then exactly 10 market board rows are displayed
    And one row is the player's selected asset
    And two rows are same-sector competitor assets
    And seven rows are other-sector averages
    And the market dashboard ranks all 24 fictional assets around the player's asset

  Scenario: Show same-sector peers
    Given the player's selected asset belongs to a sector with two peer assets
    When the Market Board is built
    Then the two same-sector peer assets are displayed

  Scenario: Show news-affected other-sector averages
    Given Morning News affects a non-player sector
    When other-sector average rows are selected
    Then the affected sector average should be displayed

  Scenario: Keep non-player market rows simplified
    Given non-player market rows are displayed on the Market Board
    Then each non-player market row shows simplified movement
    And non-player market rows do not use detailed budget, holding ratio, or surveillance state

  Scenario: Show exchange-style quote context
    Given non-player market rows are displayed on the Market Board
    Then each same-sector competitor row has a fictional current price and average price
    And each other-sector average row has a fictional current price and average price
