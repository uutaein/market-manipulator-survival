@ui @ux @visual @playwright @tc-ux-doc-collapse-001
Feature: Document Event collapse-risk experience
  Collapse-risk document events must explain the crash-line context before the player chooses a response.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And a collapse-risk Document Event popup is open
    And the game uses the Playwright visual renderer

  Scenario: Choose a response from a collapse-risk document event
    When the Document Event popup is rendered
    Then the collapse-risk title is prominent
    And current change, crash line, and remaining buffer are visible in the document body
    And stable, aggressive, and watch responses show distinct abstract effects
    And budget-changing choices expose the budget change before commit
    And the paused state is visible above the dimmed intraday screen
