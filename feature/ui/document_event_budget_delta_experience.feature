@ui @ux @visual @playwright @tc-ux-doc-budget-001
Feature: Document Event budget delta experience
  Document Event choices that change budget must expose that budget change before commit.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And a Document Event popup is open
    And the game uses the Playwright visual renderer

  Scenario: Read budget-changing document choices
    When the Document Event popup is rendered
    Then choices that recover budget show a positive budget badge
    And choices that spend budget show a negative budget badge
    And choices without immediate budget change avoid a misleading budget badge
    And the abstract stat delta summary remains visible below each choice
