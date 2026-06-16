@ui @ux @visual @playwright @tc-ux-run-setup-001
Feature: Run Setup experience
  The asset selection screen must make the current choice and its playable implications scannable.

  Background:
    Given the browser game starts from a clean local state
    And the player chooses Free Mode from the Main Menu
    And the game uses the Playwright visual renderer

  Scenario: Review a sector and asset before starting a Run
    When the Run Setup screen is rendered
    Then the selected sector and selected asset are summarized prominently
    And recommended entry sectors are visible as quick-read signals
    And the same-sector asset choices are shown as comparable cards
    And the selected asset memo shows role, baseline value, and news sensitivity
    And hidden asset profile traits are presented as Run observation targets
    And the start control is visually anchored after the decision context
