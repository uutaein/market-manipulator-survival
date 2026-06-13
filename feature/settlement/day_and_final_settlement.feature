@mvp @settlement @feat-019 @feat-020 @feat-021 @feat-022
Feature: Day and Final Settlement
  Settlement combines actual profit, surveillance grade, holding risk, and social cost.

  Scenario: Classify Day result
    Given intraday operation ends without forced failure
    When Day Settlement is calculated
    Then actual profit and surveillance grade are the primary result axes
    And supporting risk metrics are displayed
    And the Day result is one of the 8 MVP Day result categories

  Scenario: Prevent high-surveillance perfect success
    Given the player reaches the target band
    And the surveillance grade is high
    When Day Settlement is calculated
    Then the Day result is not "완전 성공"

  Scenario: Apply holding ratio risk
    Given Day Settlement or Final Settlement is calculated
    When holding ratio is evaluated
    Then it is classified into one of the 4 MVP holding bands
    And high holding ratio is shown as a settlement risk

  Scenario: Calculate Final Settlement after Day 5
    Given Day 5 Settlement is complete
    When Final Settlement is calculated
    Then cumulative actual profit, final surveillance grade, average surveillance grade, successful Days, final budget, final holding ratio, and social cost are considered
    And the final grade is one of S, A, B, C, D, or F

  Scenario: Apply forced failure final grade
    Given a forced failure occurred during the Run
    When the final result is shown
    Then the final grade is F
    And the failure reason is displayed
