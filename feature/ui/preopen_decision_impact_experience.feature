@ui @ux @visual @playwright @tc-ux-preopen-impact-001
Feature: Pre-open decision impact experience
  The pre-open screen must summarize the immediate cost and risk of the selected early-positioning ratio.

  Background:
    Given the browser game starts from a clean local state
    And the player starts a new Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Read impact before confirming early positioning
    When the Pre-open Card screen is rendered for Day 1
    And the early positioning ratio is moved into a high-risk band
    Then the decision impact panel shows the chosen ratio
    And the decision impact panel shows remaining budget
    And the decision impact panel marks concentrated risk before confirmation
    And Morning News remains locked until the player confirms the choice
