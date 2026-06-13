@mvp @preopen @cards @feat-009 @feat-010
Feature: Pre-open Card selection and Opening Approval
  The player makes one pre-open response before entering intraday operation.

  Scenario: Choose at most one Pre-open Card
    Given the player has reviewed Morning News and the Market Briefing
    When the Pre-open Card screen is shown
    Then the player can choose "시장 관찰"
    And the player can choose "사전 포지션 구축"
    And the player can choose "방어 자금 배정"
    And the player can choose "관망"
    And no more than one Pre-open Card can be selected for the Day

  Scenario: Use "관망" as the explicit no-card choice
    Given the player does not want to spend budget before opening
    When the player chooses "관망"
    Then no pre-open stat effect is applied
    And the player's budget is preserved

  Scenario: Require Opening Approval before intraday operation
    Given the player has selected a Pre-open Card or "관망"
    When the player has not approved the opening
    Then intraday operation cannot start
    When the player performs Opening Approval
    Then intraday operation starts
