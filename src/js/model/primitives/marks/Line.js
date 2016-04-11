'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    sg = require('../../../model/signals'),
    Mark = require('./Mark'),
    anchorTarget = require('../../../util/anchor-target'),
    test = require('../../../util/test-if'),
    propSg = require('../../../util/prop-signal');

var DELTA = sg.DELTA,
    DX = DELTA + '.x',
    DY = DELTA + '.y';

/**
 * @classdesc A Lyra Line Mark Primitive.
 * @see  {@link https://github.com/vega/vega/wiki/Marks#line}
 * @extends {Mark}
 *
 * @constructor
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} props.type - The type of mark (should be 'line')
 * @param {Object} props.properties - A Vega mark properties object
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Line(props) {
  Mark.call(this, props || Line.defaultProperties());
}

// inherit Mark class' prototype
inherits(Line, Mark);

/**
 * Returns an object representing the default values for a rect mark, containing
 * a type string and a Vega mark properties object.
 *
 * @static
 * @param {Object} [props] - Props to merge into the returned default properties object
 * @returns {Object} The default mark properties
 */
Line.defaultProperties = function(props) {
  var defaults = {
    type: 'line',
    // name: 'line' + '_' + counter.type('line'); // Assign name in the reducer
    // _id: assign ID in the reducer
    properties: Mark.mergeProperties(Mark.defaultProperties(), {
      update: {
        stroke: {value: '#000000'},
        strokeWidth: {value: 3}
      }
    })
  };
  // Mark gives us two defaults we do not want
  delete defaults.properties.update.fill;
  delete defaults.properties.update.fillOpacity;
  return dl.extend(defaults, props);
};

/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} line - A line properties object or instantiated line mark
 * @param {number} line._id - A numeric mark ID
 * @param {string} line.type - A mark type, presumably "line"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
Line.getHandleStreams = function(line) {
  var at = anchorTarget.bind(null, line, 'handles'),
      x = propSg(line, 'x'),
      y = propSg(line, 'y'),
      streamSignals = {};

  streamSignals[x] = [{
    type: DELTA, expr: test(at(), x + '+' + DX, x)
  }];
  streamSignals[y] = [{
    type: DELTA, expr: test(at(), y + '+' + DY, y)
  }];
  return streamSignals;
};

Line.prototype.export = function(resolve) {
  var spec = Mark.prototype.export.call(this, resolve);
  if (!spec.from) {
    spec.from = {
      data: 'dummy_data_line'
    };
    spec.properties.update.x = {
      field: 'foo'
    };
    spec.properties.update.y = {
      field: 'bar'
    };
  }

  return spec;
};

module.exports = Line;
