/* eslint no-undefined:0 */
'use strict';
var dl = require('datalib'),
    Scale = require('../primitives/Scale'),
    rules = require('./'),
    model = require('../'),
    lookup = model.lookup,
    store = require('../../store'),
    addScaleToGroup = require('../../actions/ruleActions').addScaleToGroup;

var REF_CELLW = {data: 'layout', field: 'cellWidth'},
    REF_CELLH = {data: 'layout', field: 'cellHeight'};

/**
 * Helper function to determine how to set the points property of a vega scale,
 * depending on the mark to which that scale is applied
 *
 * @private
 * @param {string} defType - The type of scale
 * @param {string} markType - The type of mark
 * @returns {boolean} The value of the "points" property of the Vega scale
 */
function usePoints(defType, markType) {
  return defType === 'ordinal' && markType !== 'rect';
}

/**
 * Tests whether a Lyra Scale primitive is equal to a parsed Vega scale
 * definition. Accounts for idiosyncracies with how Vega-Lite outputs scales.
 * For example, Vega-Lite always produces ordinal "point" scales but Lyra
 * prefers to use ordinal "band" scales for rect marks to simplify encoding
 * specification. TODO: revisit?
 *
 * @private
 * @memberOf rules.scales
 * @param  {Object} def   A parsed Vega scale definition.
 * @param  {Scale}  scale A Lyra Scale primitive
 * @returns {boolean} Returns true or false based on if the given Lyra scale
 * matches the parsed Vega definition.
 */
function equals(def, scale) {
  var points = usePoints(def.type, this.type);

  return scale.type === def.type && !!scale.points === points &&
    dl.equal(scale._domain, def._domain) && scale.range === def.range;
}

/**
 * Constructs a new Lyra Scale primitive, or updates an existing one, based on
 * the given parsed Vega scale definition.
 *
 * @private
 * @memberOf rules.scales
 * @param  {Object} def A parsed Vega scale definition
 * @returns {void}
 */
function findOrCreateScale(def) {
  var points = usePoints(def.type, this.type),
      allScales = model.scale(),
      scale = allScales.find(equals.bind(this, def));

  if (!scale) {
    scale = model.scale(new Scale(def.name, def.type, undefined, def.range));
    scale._domain = def._domain;
    scale.points = points;
    if (points) {
      scale.padding = def.padding;
    }
  }

  scale.nice = def.nice;
  scale.round = def.round;

  this._rule._map.scales[def.name] = scale._id;

  // hacky fix: rerender ui ---------------------
  var Sidebars = require('../../components');
  Sidebars.forceUpdate();
  // --------------------------------------------

  store.dispatch(addScaleToGroup(scale, this._parent));
}

/**
 * Parse a Vega scale definition (produced by Vega-Lite) and return an object
 * that mimics Lyra's Scale primitive. Note: this does not construct a Lyra Scale
 * primitive, but instead produces an object to compare existing Scale
 * primitives against. We map from Vega scale DataRefs to Lyra Primitive
 * IDs, and account for Vega-Lite idiosyncracies such as hardcoded ranges and
 * band sizes.
 *
 * @private
 * @memberOf rules.scales
 * @param  {Object} def A Vega scale definition.
 * @returns {Object} An object that mimics a Lyra Scale primitive.
 */
function parse(def) {
  if (!def) {
    return null;
  }
  var map = this._rule._map.data,
      domain = def.domain,
      range = def.rangeMin || def.rangeMax,
      data;

  if (!dl.isArray(domain)) {
    data = lookup(map[domain.data]);
    def._domain = [data.schema()[domain.field]._id];
  }

  if (def.name === 'x' || range === rules.CELLW || dl.equal(range, REF_CELLW)) {
    def.range = 'width';
  } else if (def.name === 'y' || range === rules.CELLH || dl.equal(range, REF_CELLH)) {
    def.range = 'height';
  }

  delete def.rangeMin;
  delete def.rangeMax;
  delete def.bandSize;
  return def;
}

/**
 * Parse the scale definitions in the resultant Vega specification to determine
 * if new Lyra scale primitives should be constructed, or existing ones updated.
 * @todo Why do we not pass `channel` so that only scales for the bound channel
 * are evaluated?
 *
 * @namespace rules.scales
 * @memberOf rules
 * @param {Object} parsed - An object containing the parsed rule and output Vega spec.
 * @returns {void}
 */
function scales(parsed) {
  var map = this._rule._map.scales,
      channels = dl.keys(parsed.rule.encoding), // Only account for channels defined in the rule.
      markScales = parsed.spec.marks[0].scales, // For a VLSingle, all scales are defined within the first group mark.
      len = channels.length,
      name, def, curr, find = function(x) {
        return x.name === name;
      };

  for (var i = 0; i < len; ++i) {
    // Vega-Lite names scales by the channel they're used for. If we've previously
    // parsed a scale for a channel, it will exist within the rule's map.
    name = channels[i];
    curr = lookup(map[name]);

    // Find a corresponding definition within the compiled Vega spec, and parse
    // it so that we can test to see if we should update an existing scale or
    // create a new one.
    def = parse.call(this, markScales.find(find));
    if (!def) {
      continue;
    }

    // If no current scale exists for this channel, or if there's a mismatch in
    // definitions, construct or update the Lyra model.
    if (!curr || !equals.call(this, def, curr)) {
      findOrCreateScale.call(this, def);
    }
  }
}

module.exports = scales;
