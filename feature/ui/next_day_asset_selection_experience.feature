@ui @ux @visual @playwright @tc-ux-next-day-asset-001
Feature: Next Day Asset Selection experience
  After ending a Free Mode Day with no remaining position, the asset selection screen must feel like a continuing Run decision.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Day Settlement in Free Mode after fully clearing the position
    And the game uses the Playwright visual renderer

  Scenario: Choose the next fictional asset while preserving Run context
    When the Next Day Asset Selection screen is rendered
    Then the screen title and target summary communicate that this is the next Day selection flow
    And sector and asset choices remain comparable and selectable
    And the selected asset memo still shows role, baseline value, and news sensitivity
    And the Run carryover panel shows preserved budget, cumulative profit, surveillance, social cost, and flat holding state
    And the next Day preparation control is visually anchored after the continuing Run context
