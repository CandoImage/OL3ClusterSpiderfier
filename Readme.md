# Cluster Spiderfier for Openlayers 3

Initial Developers:

* [Kai Jauslin](https://github.com/kaij)
* [Peter Philipp](https://github.com/das-peter)

Inspired by https://github.com/alrocar/OLSpiderfy

# How it works

The interaction will listen to events on sources which are instances of 
`ol.source.Cluster` and show each feature of the e.g. clicked cluster around the
clustered feature.

# Usage

Simply add the plugin as interaction:

    var map = new ol.Map({
      layers: [raster, clusters],
      renderer: 'canvas',
      interactions: ol.interaction.defaults().extend([new ol.interaction.ClusterSpiderfier()]),
      target: 'map',
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });
