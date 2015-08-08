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

## Options

* `geometry`: The geometry type to use for drawing the opening display: `circle` 
or `spiral`. Default: `circle`
* `radius`: The radius to use when drawing the opening geometry. Default: 50

## Properties

When accessing a spiderfied feature you can access the layer the spider 
originates from using the property `originLayer`. Example:

    feature.get('originLayer')
