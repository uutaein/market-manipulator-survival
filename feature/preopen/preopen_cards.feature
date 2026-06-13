@mvp @preopen @cards @feat-009 @feat-010
Feature: Pre-open Card selection and Opening Approval
  The player makes one pre-open response before entering intraday operation.

  Scenario: Choose at most one Pre-open Card
    Given a new Day begins before Morning News is revealed
    When the Pre-open Card screen is shown
    Then the player can choose "사전 포지션 확보"
    And the player can choose "뉴스 배정: 호재"
    And the player can choose "뉴스 배정: 악재"
    And the player can choose "종목 분석"
    And the player can choose "관망"
    And no more than one Pre-open Card can be selected for the Day

  Scenario: Require early positioning when no carried position exists
    Given a new Day begins before Morning News is revealed
    And the Run has no carried position
    When the Pre-open Card screen is shown
    Then the player can choose "사전 포지션 확보"
    And the player cannot choose "뉴스 배정: 호재"
    And the player cannot choose "뉴스 배정: 악재"
    And the player cannot choose "종목 분석"
    And the player cannot choose "관망"
    When the player chooses "관망"
    Then the Pre-open Card selection is rejected

  Scenario: Reveal Morning News after the pre-open choice
    Given a new Day begins before Morning News is revealed
    When the player chooses "뉴스 배정: 호재"
    Then Morning News has not been shown yet
    When the player confirms the pre-open choice
    Then Morning News and the Market Briefing are shown

  Scenario: Adjust early positioning by current budget ratio
    Given a new Day begins before Morning News is revealed
    When the player chooses early positioning with 35 percent of current budget
    Then the pre-open effect spends 35 percent of the current budget
    And the early positioning effect stores the chosen budget ratio

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
