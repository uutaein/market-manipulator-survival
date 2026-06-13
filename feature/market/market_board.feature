@mvp @market @board @feat-018
Feature: Market Board display
  The MVP Market Board shows the player asset in detail and 7 non-player assets in simplified form.

  Scenario: Display 8 assets on the Market Board
    Given intraday operation has started
    When the Market Board is shown
    Then exactly 8 assets are displayed
    And one displayed asset is the player's selected asset
    And seven displayed assets are non-player assets

  Scenario: Show same-sector peers
    Given the player's selected asset belongs to a sector with two peer assets
    When the Market Board is built
    Then the two same-sector peer assets are displayed

  Scenario: Prioritize news-affected representative assets
    Given Morning News affects a non-player sector
    When representative other-sector assets are selected
    Then at least one asset from the affected sector should be displayed

  Scenario: Keep non-player assets simplified
    Given non-player assets are displayed on the Market Board
    Then each non-player asset shows simplified movement
    And non-player assets do not use detailed budget, holding ratio, or surveillance state
