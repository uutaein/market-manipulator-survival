@ui @ux @visual @playwright @tc-ux-contract-brief-tools-001
Feature: Contract Briefing tool fit experience
  Contract briefing must preview which shared manual tools fit or conflict with the mandate before Opening Approval.

  Background:
    Given the browser game starts from a clean local state
    And the player accepts a Contract Mode mandate
    And the player reaches the Contract Mode Morning Briefing
    And the game uses the Playwright visual renderer

  Scenario: Review shared tool fit before accepting opening risk
    When the Contract Briefing is rendered before Opening Approval
    Then the briefing shows recommended shared tools for the accepted mandate
    And risky shared tools are visible before intraday operation starts
    And the tool copy uses abstract game tool labels instead of real-world procedure language
    And target, reward, risk, expert report, Today condition, and Opening Approval remain visible
