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
 * @classdesc A Lyra Rect Mark Primitive.
 * @extends {Mark}
 *
 * @constructor
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} props.type - The type of mark (should be 'rect')
 * @param {Object} props.properties - A Vega mark properties object
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Rect(props) {
  Mark.call(this, props || Rect.defaultProperties());
}

inherits(Rect, Mark);

/**
 * Returns an object representing the default values for a rect mark, containing
 * a type string and a Vega mark properties object.
 *
 * @static
 * @param {Object} [props] - Props to merge into the returned default properties object
 * @returns {Object} The default mark properties
 */
Rect.defaultProperties = function(props) {
  return dl.extend({
    type: 'rect',
    // name: 'rect' + '_' + counter.type('rect'); // Assign name in the reducer
    // _id: assign ID in the reducer
    properties: Mark.mergeProperties(Mark.defaultProperties(), {
      update: {
        x2: {value: 60},
        y2: {value: 60},
        xc: {value: 60, _disabled: true},
        yc: {value: 60, _disabled: true},
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
 * @param {Object} rect - A rect properties object or instantiated Rect mark
 * @param {number} rect._id - A numeric mark ID
 * @param {string} rect.type - A mark type, presumably "rect"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
Rect.getHandleStreams = function(rect) {
  var at = anchorTarget.bind(null, rect, 'handles'),
      x = propSg(rect, 'x'),
      xc = propSg(rect, 'xc'),
      x2 = propSg(rect, 'x2'),
      y = propSg(rect, 'y'),
      yc = propSg(rect, 'yc'),
      y2 = propSg(rect, 'y2'),
      w = propSg(rect, 'width'),
      h = propSg(rect, 'height'),
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

module.exports = Rect;
