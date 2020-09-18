/* eslint no-undefined: 0 */
'use strict';

import * as vg from 'vega';
import {Runtime, Spec, View} from 'vega';
import {CELL, MOUSE} from '../store/factory/Signal';
import {exporter} from './export';
import {BUBBLE_CURSOR, BUBBLE_CURSOR_TIP} from './manipulators';
import {hydrate, persist} from './persist';
import {api} from './signals';

const dl = require('datalib'),
  manips = require('./manipulators'),
  ns = require('../util/ns'),
  CancellablePromise = require('../util/simple-cancellable-promise');

interface LyraCtrl {
  view: View,
  export: (internal: boolean, preview?: boolean) => Spec,
  persist: () => {},
  hydrate: ({}) => void,
  manipulators: () => Spec,
  parse: (el: string) => Promise<Runtime>,
  update: () => void
};

/** @namespace */
const ctrl: LyraCtrl = (module.exports = {view: null} as any),
  listeners = require('./listeners');

// Local variable used to hold the last-initiated Vega ctrl reparse
let parsePromise = null;

ctrl.export = exporter;
ctrl.persist = persist;
ctrl.hydrate = hydrate;

/**
 * Exports the ctrl as a complete Vega specification with extra definitions
 * to power Lyra-specific interaction. In particular, this includes definitions
 * of all the Lyra-specific signals and manipulators (handles, channels, etc.).
 * @returns {Object} A Vega specification.
 */
ctrl.manipulators = function(): Spec {
  const spec = ctrl.export(true),
    data = spec.data || (spec.data = []),
    signals = spec.signals || (spec.signals = []),
    marks = spec.marks || (spec.marks = []),
    idx = dl.comparator('_idx');

  // Stash signals from vega into the lyra ctrl, in preparation for seamlessly
  // destroying & recreating the vega view
  // api() is a function that returns all registered signals
  signals.push.apply(signals, Object.values(api()).sort(idx));

  data.push({
    name: 'bubble_cursor',
    transform: [{
      type: ns('bubble_cursor'),
      lyra_cell: {signal: CELL},
      lyra_mouse: {signal: MOUSE}
    } as any]
  });

  marks.push(BUBBLE_CURSOR);
  marks.push.apply(marks, BUBBLE_CURSOR_TIP);

  data.push({
    name: 'dummy_data',
    values: [{x: 0, y: 0}, {x: 100, y: 100}]
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
ctrl.parse = function(el: string) {
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
    const that = this;
    setTimeout(function() {
      if (that.cancelled) {
        return;
      }
      // Recreate the vega spec
      try {
        resolve(vg.parse(ctrl.manipulators()));
      } catch (e) {
        console.error(e);
      }
    }, 10);
  });

  return parsePromise.then(function(runtime) {
    ctrl.view = new vg.View(runtime, {renderer: 'svg'})
      .initialize(el)
      .logLevel(vg.Warn)
      .hover();

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
  if (ctrl.view && ctrl.view.runAsync && typeof ctrl.view.runAsync === 'function') {
    ctrl.view.runAsync();
  }
};
