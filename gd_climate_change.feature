Feature: GD climate change

  18 languages including English. No custom sharing URLs.

  Release: Friday 27 November
  Promote: Monday 30 November

  Scenario: Landing page - universal elements (all devices)
    When I first land on the page
    Then I should see a title
    And I should see a title graphic
    And I should see a call to action to scroll down

  Scenario: Scrolling past the hottest/coldest graph
    When I scroll down
    And the hottest/coldest graph comes into view
    Then I should see y axis labels
    And I should see x axis labels
    And I should see a horizontal line labelled '20th century average temperature'
    And I should see a source credit below the graph

  Scenario: Stopping scrolling at the hottest/coldest graph
    When I scroll down
    And the hottest/coldest graph comes into view
    And I stop scrolling
    Then I should see one graph line appear for each year beginning with 1880 and ending with 2015
    And I should see the lines for the ten coldest years appear in purple
    And I should see the lines for the ten hottest years appear in red
    And I should see the lines for all the other years appear in grey
    And I should see the lines for the coldest year and hottest year are thick
    And I should see all the lines appear at full opacity
    And I should see all the lines except for the hottest year and coldest year set to 50% opacity after appearing
    And when each line appears
    Then I should see the corresponding year displayed in bold text above the graph
    And when the line for the coldest year appears
    Then I should see the text 'is the coldest year on record so far' after the bold text above the graph
    And when the line for the hottest year appears
    Then I should see the text 'is the warmest year on record so far' after the bold text above the graph

  Scenario: Hovering over a line on the hottest/coldest graph
    When I hover over a line on the hottest/coldest graph
    Then I should see the correct year displayed as text over the graph

  Scenario: Scrolling past the greenhouse gases graph
    When I scroll down
    And the greenhouse gases graph comes into view
    Then I should see y axis labels
    And I should see x axis labels
    And I should see a line representing the x axis
    And I should see tick marks at 5 year intervals on the line representing the x axis
    And I should see a text label for the first value on the graph
    And I should see a text label for the final value on the graph
    And I should see a source credit below the graph

  Scenario: Stopping scrolling at the greenhouse gases graph
    When I scroll down
    And the greenhouse gases graph comes into view
    And I stop scrolling
    Then I should a green line animating into view in the x axis direction

  Scenario: Scrolling past the ice caps datavis
    When I scroll down
    And the ice caps datavis comes into view
    Then I should see a map of the northern hemisphere
    And I should a coloured area labelled 'Sea ice extent (minimum)' in the centre of the map
    And I should see an area graph below the map
    And I should see a set of x axis labels starting with 1980 and ending with 2015 at the top of the area graph
    And the x axis should be labelled at 5 year intervals
    And the year 1980 should be highlighted on the x axis
    And the area graph should contain a segment corresponding to each 5 year period
    And the first area graph segment should be contain an area coloured blue
    And the remaining area graph segments should contain areas coloured grey  
    And the segment line below the first x axis label should be highlighted by line thickness

  Scenario: Stopping scrolling at the ice caps datavis
    When I scroll down
    And the ice caps datavis comes into view
    And I stop scrolling
    Then I should see the coloured area in the center of the map animate
    And I should see each x axis label on the area graph highlight then return to the default state in chronological order until 2015 is highlighted
    And I should see each segment of the area graph turn blue as the corresponding x axis label is highlighted until all the areas for all segments are blue
    And I should see each segment line on the area graph highlight then return to the default state as the corresponding x axis label is highlighted until the segment line for 2015 is highlighted