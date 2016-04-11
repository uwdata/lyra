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
 * @classdesc A Lyra Area Mark Primitive.
 * @see  {@link https://github.com/vega/vega/wiki/Marks#area}
 * @extends {Mark}
 *
 * @constructor
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} props.type - The type of mark (should be 'area')
 * @param {Object} props.properties - A Vega mark properties object
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Area(props) {
  Mark.call(this, props || Area.defaultProperties());
}

// inherit Mark class' prototype
inherits(Area, Mark);

/**
 * Returns an object representing the default values for an area mark,
 * containing a type string and a Vega mark properties object.
 *
 * @static
 * @param {Object} [props] - Props to merge into the returned default properties object
 * @returns {Object} The default mark properties
 */
Area.defaultProperties = function(props) {
  return dl.extend({
    type: 'area',
    // name: 'area' + '_' + counter.type('area'); // Assign name in the reducer
    // _id: assign ID in the reducer
    properties: Mark.mergeProperties(Mark.defaultProperties(), {
      update: {
        x2: {value: 0},
        y2: {value: 0},
        xc: {value: 60, _disabled: true},
        yc: {value: 60, _disabled: true},
        tension: {value: 13},
        interpolate: {value: 'monotone'},
        fill: {value: '#55498D'},
        stroke: {value: '#55498D'},
        orient: {value: 'vertical'},
        width: {value: 30, _disabled: true},
        height: {value: 30, _disabled: true}
      }
    })
  }, props);
};


/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} area - A area properties object or instantiated area mark
 * @param {number} area._id - A numeric mark ID
 * @param {string} area.type - A mark type, presumably "area"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
Area.getHandleStreams = function(area) {
  var at = anchorTarget.bind(null, area, 'handles'),
      x = propSg(area, 'x'),
      xc = propSg(area, 'xc'),
      x2 = propSg(area, 'x2'),
      y = propSg(area, 'y'),
      yc = propSg(area, 'yc'),
      y2 = propSg(area, 'y2'),
      w = propSg(area, 'width'),
      h = propSg(area, 'height'),
      streamSignals = {};

  streamSignals[x] = [{
    type: DELTA, expr: test(at() + '||' + at('left'), x + '+' + DX, x)
  }];
  streamSignals[xc] = [{
    type: DELTA, expr: test(at() + '||' + at('left'), xc + '+' + DX, xc)
  }];
  streamSignals[x2] = [{
    type: DELTA, expr: test(at() + '||' + at('right'), x2 + '+' + DX, x2)
  }];
  streamSignals[y] = [{
    type: DELTA, expr: test(at() + '||' + at('top'), y + '+' + DY, y)
  }];
  streamSignals[yc] = [{
    type: DELTA, expr: test(at() + '||' + at('top'), yc + '+' + DY, yc)
  }];
  streamSignals[y2] = [{
    type: DELTA, expr: test(at() + '||' + at('bottom'), y2 + '+' + DY, y2)
  }];
  streamSignals[w] = [
    {type: DELTA, expr: test(at('left'), w + '-' + DX, w)},
    {type: DELTA, expr: test(at('right'), w + '+' + DX, w)}
  ];
  streamSignals[h] = [
    {type: DELTA, expr: test(at('top'), h + '-' + DY, h)},
    {type: DELTA, expr: test(at('bottom'), h + '+' + DY, h)}
  ];
  return streamSignals;
};


Area.prototype.export = function(resolve) {
  var spec = Mark.prototype.export.call(this, resolve);
  if (!spec.from) {
    spec.from = {
      data: 'dummy_data_area'
    };
    spec.properties.update.x = {
      field: 'x'
    };
    spec.properties.update.y = {
      field: 'y'
    };
  }
  if (spec.properties.update.orient.value === 'horizontal') {
    delete spec.properties.update.y2;
  } else {
    delete spec.properties.update.x2;
  }
  return spec;
};

// Parameters you can set on AREA
Area.INTERPOLATE = [
  'linear',
  'step-before',
  'step-after',
  'basis',
  'basis-open',
  'cardinal',
  'cardinal-open',
  'monotone'
];
Area.ORIENT = ['horizontal', 'vertical'];

module.exports = Area;
