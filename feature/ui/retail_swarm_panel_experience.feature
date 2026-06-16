@ui @ux @visual @playwright @tc-ux-retail-swarm-001
Feature: Retail Swarm panel experience
  The Retail Swarm panel must make participation risk readable without realistic crowd depiction.

  Background:
    Given the browser game starts from a clean local state
    And the player reaches Intraday operation in a Free Mode Run
    And Retail Swarm is in a panic-risk state
    And the game uses the Playwright visual renderer

  Scenario: Read swarm pressure during intraday operation
    When the Retail Swarm panel is rendered
    Then raw internal MADNESS and pressure metrics are hidden
    And the swarm state is shown as an abstract warning panel
    And panic or overheat risk is visually distinct from normal interest
    And the panel explains risk using player-facing stable, warning, or panic copy
    And the ant-skin meme mascot reflects the current swarm mood
    And the visual treatment avoids realistic crowd or real-market language
