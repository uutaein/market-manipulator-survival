Feature: Local synthetic execution engine
  The game uses a local synthetic execution gateway for fictional order-book depth.

  Scenario: Reference engine exposes local synthetic depth
    Given a local synthetic execution engine
    When synthetic limit orders seed both sides of the book
    Then the local depth snapshot is sorted by best price
    And the depth snapshot contains only synthetic quantities

  Scenario: Synthetic crossing orders produce lifecycle reports
    Given a local synthetic execution engine
    And seeded sell-side synthetic depth
    When a crossing synthetic buy order is submitted
    Then local execution reports include a trade and final fill
    And remaining depth reflects the partial consumption
    When the remaining synthetic order is canceled
    Then the local engine removes it from the book

  Scenario: Intraday order-book profile uses local execution depth
    Given intraday operation starts
    When a synthetic buy wall is added to a visible bid level
    Then the order-book profile reads the active level from execution depth
    And downward responsiveness decreases while the synthetic wall is active
