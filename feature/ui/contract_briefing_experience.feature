@ui @ux @visual @playwright @tc-ux-contract-brief-001
Feature: Contract Briefing experience
  Contract Mode must restate the mandate before the first intraday session.

  Background:
    Given the browser game starts from a clean local state
    And the player accepts a Contract Mode mandate
    And the game uses the Playwright visual renderer

  Scenario: Review mandate details before opening approval
    When the Morning Briefing screen is rendered for Contract Mode
    Then the contract briefing is visible before the first intraday session
    And the target asset, remaining Days, fixed reward, risk level, and report confidence are visible
    And the target threshold or bandline is visible
    And the success conditions and expert report summary are visible
    And recommended and risky shared tools are visible before Opening Approval
    And opening approval remains the primary next action
