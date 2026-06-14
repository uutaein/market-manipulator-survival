@mvp @preopen @cards @feat-009 @feat-010
Feature: Pre-open Card selection and Opening Approval
  The player makes one pre-open response before entering intraday operation.

  Scenario: Choose at most one Pre-open Card
    Given Day 2 begins before Morning News is revealed with a carried position
    When the Pre-open Card screen is shown
    Then the player can choose "선취매"
    And the player can choose "뉴스 배정: 호재"
    And the player can choose "뉴스 배정: 악재"
    And the player can choose "종목 분석"
    And the player can choose "관망"
    And no more than one Pre-open Card can be selected for the Day

  Scenario: Only early positioning is available on Day 1
    Given a new Day begins before Morning News is revealed
    When the Pre-open Card screen is shown
    Then the player can choose "선취매"
    And the player cannot choose "뉴스 배정: 호재"
    And the player cannot choose "뉴스 배정: 악재"
    And the player cannot choose "종목 분석"
    And the player cannot choose "관망"

  Scenario: Require early positioning when no carried position exists
    Given a new Day begins before Morning News is revealed
    And the Run has no carried position
    When the Pre-open Card screen is shown
    Then the player can choose "선취매"
    And the player cannot choose "뉴스 배정: 호재"
    And the player cannot choose "뉴스 배정: 악재"
    And the player cannot choose "종목 분석"
    And the player cannot choose "관망"
    When the player chooses "관망"
    Then the Pre-open Card selection is rejected

  Scenario: Reveal Morning News after the pre-open choice
    Given Day 2 begins before Morning News is revealed with a carried position
    When the player chooses "뉴스 배정: 호재"
    Then Morning News has not been shown yet
    When the player confirms the pre-open choice
    Then Morning News and the Market Briefing are shown

  Scenario: Adjust early positioning by current budget ratio
    Given a new Day begins before Morning News is revealed
    When the player chooses early positioning with 35 percent of current budget
    Then the pre-open effect spends 35 percent of the current budget
    And the early positioning effect stores the chosen budget ratio

  Scenario: Allow high-risk early positioning up to 85 percent
    Given a new Day begins before Morning News is revealed
    When the player chooses early positioning with 85 percent of current budget
    Then the pre-open effect spends 85 percent of the current budget
    And the early positioning maximum budget ratio is 85 percent
    And the early positioning choice is marked as high-risk concentration

  Scenario: Early positioning starts with a premium entry loss
    Given a new Day begins before Morning News is revealed
    When the player chooses early positioning with 35 percent of current budget
    And intraday operation starts
    Then the early positioning premium is between 2 and 7 percent
    And the average entry price is above the opening price
    And the initial position valuation is below its cost basis
    And the initial total valuation is below the Day starting budget

  Scenario: Allow no additional early positioning when a position carries over
    Given Day 2 begins before Morning News is revealed with a carried position
    When the player chooses early positioning with 0 percent of current budget
    Then the pre-open effect spends 0 percent of the current budget
    And the early positioning effect stores 0 percent as the chosen budget ratio
    And no pre-open stat effect is applied for the early positioning choice

  Scenario: Higher early positioning increases holding and reduces opening liquidity
    Given a new Day begins before Morning News is revealed
    When the player compares low and high early positioning
    Then higher early positioning grants more holding ratio
    And higher early positioning leaves lower opening liquidity

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
