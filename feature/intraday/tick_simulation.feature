@mvp @intraday @simulation @feat-011 @feat-012 @feat-013
Feature: Intraday tick simulation
  Intraday operation updates fictional pressure-management stats and price movement once per second.

  Scenario: Run the 180-second intraday timer
    Given intraday operation starts
    Then the intraday timer starts at 180 seconds
    When the timer reaches 0
    Then the Day transitions to Day Settlement

  Scenario: Pause ticks during modal decisions
    Given intraday operation is active
    When a document event or auto card reward choice is open
    Then the intraday timer pauses
    And price ticks do not run
    When the player resolves the modal decision
    Then intraday operation resumes

  Scenario: Calculate player asset price from components
    Given intraday operation is active
    When a price tick runs
    Then price movement is calculated from pressure, participation, holding, liquidity, competition, news, aftereffect, attention fade, order book depth, fake OHLCV simulator adjustment, and volatility noise components
    And the price is not directly overwritten by a manual action or card

  Scenario: Simulate pullback when price is overheated
    Given intraday operation is active
    When an overheated price tick runs
    Then the price simulator applies negative reversion pressure

  Scenario: Apply fictional order book responsiveness
    Given intraday operation is active
    When upward pressure meets a thin sell wall
    Then the order book multiplier amplifies upward price movement

  Scenario: Clamp bounded stats after updates
    Given an intraday stat update occurs
    Then holding ratio, personal participation, market liquidity, surveillance, volatility, and competition pressure stay within the 0 to 100 range
