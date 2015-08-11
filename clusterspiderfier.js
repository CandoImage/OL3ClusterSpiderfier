// OpenLayers 3 Cluster spiderfier.
// See https://github.com/CandoImage/OL3ClusterSpiderfier
// Version: v1.0

/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
ol.interaction.ClusterSpiderfier = function(options) {
  ol.interaction.Interaction.call(this, {
    handleEvent: ol.interaction.ClusterSpiderfier.prototype.handleEvent.bind(this)
  });

  options = options || {};
  this._map = options.map;
  this.radius = options.radius || 50;
  this.displayGeometry = options.displayGeometry || 'circle';

  this.featureOverlay_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      useSpatialIndex: true
    }),
    updateWhileAnimating: true,
    updateWhileInteracting: true
  });
  if (typeof options.style != 'undefined' && options.style) {
    this.featureOverlay_.set('hasOwnStyle', true);
    this.featureOverlay_.setStyle(options.style);
  }

  this.selected = null;
};
ol.inherits(ol.interaction.ClusterSpiderfier, ol.interaction.Interaction);

ol.interaction.ClusterSpiderfier.prototype.getFeatures = function() {
  return this.featureOverlay_.getSource().getFeatures();
};

/**
 * Remove the interaction from its current map, if any,  and attach it to a new
 * map, if any. Pass `null` to just remove the interaction from the current map.
 * @param {ol.Map} map Map.
 * @api stable
 */
ol.interaction.ClusterSpiderfier.prototype.setMap = function(map) {
  var self = this;
  this.featureOverlay_.setMap(map);
  this._map = map;

  if (map && map.getView()) {
    map.getView().on('change:resolution', function(evt) {
      // close spider when zoom level changes
      self.featureOverlay_.getSource().clear();
    })
  }
};

/**
 * Handles the {@link ol.MapBrowserEvent map browser event} and may change the
 * selected state of features.
 * @param {ol.MapBrowserEvent} mapBrowserEvent Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {ol.interaction.Select}
 * @api
 */
ol.interaction.ClusterSpiderfier.prototype.handleEvent = function(mapBrowserEvent) {
  var map = mapBrowserEvent.map;
  var self = this;

  if (!ol.events.condition.click(mapBrowserEvent)) {
    return true;
  }

  map.forEachFeatureAtPixel(mapBrowserEvent.pixel, function(feature, layer) {
    // check if feature is coming from cluster source
    var source = layer.getSource();
    if (source instanceof ol.source.Cluster) {
      if (self.selected !== feature) {
        feature.set('originLayer', layer);
        self.open(feature);
        self.selected = feature;
      }
      else {
        self.selected = null;
        self.close();
      }
    }
  });
};

ol.interaction.ClusterSpiderfier.prototype.getGeometryCenterCoordinates = function(geometry) {
  if (geometry instanceof ol.geom.Point) {
    return geometry.getCoordinates();
  }
};

ol.interaction.ClusterSpiderfier.prototype.arrangeSpiral = function(centerFeature, features) {
  var geometry, point, radius, step, center, t;
  var self = this;
  var map = this._map;

  step = 0.5;
  center = map.getPixelFromCoordinate(this.getGeometryCenterCoordinates(centerFeature.getGeometry()));
  t = 0;

  features.forEach(function(f) {
    // console.log(f);
    radius = Math.exp(0.30635*t) * self.radius;
    // console.log(radius);
    f.setGeometry(new ol.geom.Point(map.getCoordinateFromPixel([ center[0] + Math.sin(t)*radius, center[1] + Math.cos(t)*radius ])));
    t += step;
  });
};

ol.interaction.ClusterSpiderfier.prototype.arrangeCircle = function(centerFeature, features) {
  var geometry, point, radius, step, center, angle;
  var self = this;
  var map = this._map;
  var extent = this.featureOverlay_.getSource().getExtent();

  step = 2*Math.PI / features.length;
  center = map.getPixelFromCoordinate(this.getGeometryCenterCoordinates(centerFeature.getGeometry()));
  radius = this.radius;
  angle = 0.0;

  features.forEach(function(f) {
    f.setGeometry(new ol.geom.Point(map.getCoordinateFromPixel([ center[0] + Math.sin(angle)*radius, center[1] + Math.cos(angle)*radius ])));
    angle += step;
  });
};

ol.interaction.ClusterSpiderfier.prototype.open = function(feature) {
  var clusterFeatures = feature.get('features');
  // Lists with one feature shouldn't trigger the opening.
  if (clusterFeatures.length == 1) {
    return;
  }
  var source = this.featureOverlay_.getSource();
  var originLayer = feature.get('originLayer');

  // If our layer hasn't explicitly set a style inherit the one from the origin
  // layer.
  if (!this.featureOverlay_.get('hasOwnStyle') && originLayer.getStyle()) {
    this.featureOverlay_.setStyle(originLayer.getStyle());
  }

  source.clear();
  clusterFeatures.forEach(function(f) {
    var cf = f.clone();
    cf.set('originLayer', originLayer);
    source.addFeature(cf);
  });

  switch (this.displayGeometry) {
    case 'spiral':
      this.arrangeSpiral(feature, source.getFeatures());
      break;

    case 'crircle':
    default:
      this.arrangeCircle(feature, source.getFeatures());
      break;
  }

};

ol.interaction.ClusterSpiderfier.prototype.close = function() {
  var source = this.featureOverlay_.getSource();
  source.clear();
};
