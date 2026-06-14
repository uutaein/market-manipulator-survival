@mvp @intraday @actions @feat-014
Feature: Manual intraday actions
  The player uses four limited manual actions to respond to immediate intraday pressure.

  Scenario: Show the four MVP manual actions
    Given intraday operation is active
    Then the player can see "유동성 공급"
    And the player can see "매수봇"
    And the player can see "매도봇"
    And the player can see "포지션 정리"

  Scenario: Disable manual actions during modal decisions
    Given a document event or auto card reward choice is open
    Then all manual action buttons are unavailable

  Scenario: Use a manual action through state effects
    Given the player uses a manual action
    Then the action affects budget, market pressure, liquidity, participation, holding ratio, surveillance, or volatility
    And the action does not directly set the final price
    And the action enters cooldown if applicable

  Scenario: Buy bot increases held units and pays purchase budget
    Given intraday operation is active
    When the player runs buy bot long enough for position accounting
    Then held units increase
    And average entry price increases
    And budget decreases by more than the buy bot fee

  Scenario: Rising well above average entry shows positive total profit
    Given intraday operation is active
    When the player marks the asset up from the high 9000s to 14000
    Then the intraday total profit is positive

  Scenario: Total profit uses the Run baseline while Day profit uses the Day baseline
    Given intraday operation is active
    When the Day starts below the original Run budget and account value is 98
    Then the intraday total account value is 98
    And the intraday total profit is -2
    And the intraday Day profit is 41.6

  Scenario: Liquidity supply has a visible low budget cost
    Given intraday operation is active
    When the player uses liquidity supply
    Then the manual action budget change is -2

  Scenario: Buy bot has a visible moderate budget cost
    Given intraday operation is active
    When the player uses buy bot
    Then the manual action budget change is -4

  Scenario: Sell bot spends budget and compresses average-entry pressure
    Given intraday operation is active
    When the player runs sell bot long enough for position accounting
    Then holding ratio decreases
    And budget decreases
    And average entry price decreases

  Scenario: Sell bot enables cheaper re-accumulation
    Given intraday operation is active
    When the player uses sell bot to create a cheaper accumulation window
    And the player buys again in that cheaper accumulation window
    Then the average entry price is below the pre-sell average

  Scenario: Depleted budget blocks cash-cost actions without forcing Run failure
    Given intraday operation is active
    When the intraday budget is depleted while a position remains
    Then the Run is not failed by budget depletion
    And budget-cost manual actions are unavailable
    And position settlement remains available when it can recover budget

  Scenario: High MADNESS lets retail demand absorb position settlement
    Given intraday operation is active
    When the player settles a position into high MADNESS
    Then the position settlement still reduces held units
    And MADNESS absorbs part of the settlement pressure
    And MADNESS improves the settlement recovery

  Scenario: Active manual actions can be interrupted mid-gauge
    Given intraday operation is active
    When the player starts a buy bot action
    And the player interrupts the active buy bot action
    Then the buy bot action is no longer active

  Scenario: Exclude non-MVP manual buttons
    Given intraday operation is active
    Then "방어 자금 투입" is not a manual action button
    And "군중 진정" is not a manual action button
    And "관심 신호" is not a manual action button
