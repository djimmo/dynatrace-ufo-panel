# Description

This grafana panel visualizes Dynatrace UFOs using the Chart.JS library. (http://www.chartjs.org/)

The plugin was tested with:

  * Elastic Search 6.5 as data source.

## Installation

Copy the dist folder in your grafana plugin directory and rename it to dynatrace-ufo-panel.

# Versions
## v1.2 (03/01/2019)
- Added UfoName in dropdown
- Logo LEDs 3 and 4 switched
- Logo is now responsive too
- Added last update timestamp

## v1.1 (20/12/2018)
- Connected to ES datasource
- Morph and Whirl now working
- Fixed memory leak
- Code cleanup

## v1.0 (19/12/2018)
- First Version