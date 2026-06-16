@ui @ux @visual @playwright @tc-ux-run-setup-discovery-001
Feature: Run Setup discovery guard experience
  Run Setup must clarify which asset information is visible and which traits are learned during the Run.

  Background:
    Given the browser game starts from a clean local state
    And the player chooses Free Mode from the Main Menu
    And the game uses the Playwright visual renderer

  Scenario: Review the progressive asset discovery rule before starting
    When the Run Setup screen is rendered
    Then visible asset context is limited to role, baseline value, and news response
    And hidden internal traits are labeled as observation targets
    And the screen does not expose stable, standard, or high-risk asset profile labels
    And the Run start control remains visually anchored after the memo
