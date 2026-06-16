@ui @ux @visual @playwright @tc-ux-doc-event-001
Feature: Document Event popup experience
  Document event popups must pause intraday operation and present three readable response choices.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And a Document Event popup is open
    And the game uses the Playwright visual renderer

  Scenario: Choose a response from a paused document event
    When the Document Event popup is rendered
    Then the paused state is visible above the intraday screen
    And the document title and reason for interruption are visible
    And event-specific context can be shown in the document body
    And exactly three response choices are visually separated
    And stable, aggressive, and avoid response tones are distinguishable
    And each response shows its abstract stat impact without real-world procedure detail
