@ui @ux @visual @playwright @tc-ux-preopen-concentration-001
Feature: Pre-open early positioning concentration risk experience
  The early-positioning ratio control must make the high-risk concentration band visible before Morning News.

  Background:
    Given the browser game starts from a clean local state
    And the player starts a new Free Mode Run
    And the game uses the Playwright visual renderer

  Scenario: Review high early-positioning concentration before confirming
    When the Pre-open Card screen is rendered for Day 1
    And the player moves early positioning above the 50 percent threshold
    Then the slider shows the high-risk concentration band
    And the preview calls out concentrated entry and opening liquidity loss
    And budget use, remaining budget, and entry premium remain visible
    And Morning News remains locked until the choice is confirmed
