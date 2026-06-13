@mvp @intraday @actions @feat-014
Feature: Manual intraday actions
  The player uses four limited manual actions to respond to immediate intraday pressure.

  Scenario: Show the four MVP manual actions
    Given intraday operation is active
    Then the player can see "유동성 공급"
    And the player can see "가격 추진"
    And the player can see "과열 해소"
    And the player can see "포지션 일부 정리"

  Scenario: Disable manual actions during modal decisions
    Given a document event or auto card reward choice is open
    Then all manual action buttons are unavailable

  Scenario: Use a manual action through state effects
    Given the player uses a manual action
    Then the action affects budget, market pressure, liquidity, participation, holding ratio, surveillance, or volatility
    And the action does not directly set the final price
    And the action enters cooldown if applicable

  Scenario: Price push increases held units and average entry
    Given intraday operation is active
    When the player runs price push long enough for position accounting
    Then held units increase
    And average entry price increases

  Scenario: Exclude non-MVP manual buttons
    Given intraday operation is active
    Then "방어 자금 투입" is not a manual action button
    And "군중 진정" is not a manual action button
    And "관심 신호" is not a manual action button
