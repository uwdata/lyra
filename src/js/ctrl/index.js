/* eslint no-undefined: 0 */
'use strict';
var dl = require('datalib'),
    vg = require('vega'),
    sg = require('./signals'),
    manips = require('./manipulators'),
    ns = require('../util/ns'),
    CancellablePromise = require('../util/simple-cancellable-promise');

/** @namespace */
var ctrl = module.exports = {view: null},
    listeners = require('./listeners');

// Local variable used to hold the last-initiated Vega ctrl reparse
var parsePromise = null;

ctrl.export = require('./export');

/**
 * Exports the ctrl as a complete Vega specification with extra definitions
 * to power Lyra-specific interaction. In particular, this includes definitions
 * of all the Lyra-specific signals and manipulators (handles, channels, etc.).
 * @returns {Object} A Vega specification.
 */
ctrl.manipulators = function() {
  var spec = ctrl.export(true),
      data = spec.data || (spec.data = []),
      signals = spec.signals || (spec.signals = []),
      marks = spec.marks || (spec.marks = []),
      idx = dl.comparator('_idx');

  // Stash signals from vega into the lyra ctrl, in preparation for seamlessly
  // destroying & recreating the vega view
  // sg() is a function that returns all registered signals
  signals.push.apply(signals, dl.vals(sg()).sort(idx));

  data.push({
    name: 'bubble_cursor',
    transform: [{type: ns('bubble_cursor')}]
  });

  marks.push(manips.BUBBLE_CURSOR);
  marks.push.apply(marks, manips.BUBBLE_CURSOR_TIP);
  data.push({
    name: 'dummy_data_line',
    values: [
      {
        foo: 100,
        bar: 100
      },
      {
        foo: 200,
        bar: 200
      }
    ]
  });
  // I don't want line and area to overlap. When we have the option to drag onto the scene,
  // I would change this
  data.push({
    name: 'dummy_data_area',
    values: [
      {x: 100, y: 28},
      {x: 200, y: 55},
    ]
  });

  return spec;
};

/**
 * Parses the ctrl's `manipulators` spec and (re)renders the visualization.
 * @param  {string} [el] - A CSS selector corresponding to the DOM element
 * to render the visualization in.
 * @returns {Object} A Promise that resolves once the spec has been successfully
 * parsed and rendered.
 */
ctrl.parse = function(el) {
  el = el || '#vis';
  if (parsePromise) {
    // A parse is already in progress; cancel that parse's callbacks
    parsePromise.cancel();
  }

  // Start the newly-requested parse within a cancellable promise
  parsePromise = new CancellablePromise(function(resolve, reject) {

    // Debounce parse initiation very slightly to handle re-starts on subsequent
    // store listener digest cycles: CancellablePromise exposes its state through
    // this.cancel.
    var that = this;
    setTimeout(function() {
      if (that.cancelled) {
        return;
      }
      // Recreate the vega spec
      vg.parse.spec(ctrl.manipulators(), function(err, chart) {
        if (err) {
          return reject(err);
        }
        resolve(chart);
      });
    }, 10);
  });

  return parsePromise.then(function(chart) {
    ctrl.view = chart({
      el: el
    });
    // Register all event listeners to the new view
    listeners.register();
    // the update() method initiates visual encoding and rendering:
    // View has to update once before scene is ready
    ctrl.update();
    // Re-parse complete: null out the completed promise
    parsePromise = null;
  });
};

/**
 * Re-renders the current spec (e.g., to account for new signal values).
 * @returns {void}
 */
ctrl.update = function() {
  if (ctrl.view && ctrl.view.update && typeof ctrl.view.update === 'function') {
    ctrl.view.update();
  }
};

ctrl.onSignal = listeners.onSignal;
ctrl.offSignal = listeners.offSignal;
