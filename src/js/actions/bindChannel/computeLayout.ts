'use strict';

import {Dispatch} from 'redux';
import {defaultConfig} from 'vega-lite/src/config';
import {updateMarkProperty} from '../../actions/markActions';
import {setSignal} from '../../actions/signalActions';
import {State} from '../../store';

const dl = require('datalib'),
    dsUtils = require('../../util/dataset-utils'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis;

/**
 * Compute a new layout based on the latest data binding. In particular, look
 * for ordinal scales to see if we should expand the width/height of the
 * scene and any appropriate children groups.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param {Object} scale       The definition of the scale that will be added.
 * @returns {void}
 */
export function computeLayout(dispatch : Dispatch, state : State, parsed, scale) {
  const sceneId = getInVis(state, 'scene._id'),
      scene = getInVis(state, 'marks.' + sceneId),
      manualLayout = scene.get('_manualLayout');

  if (manualLayout) {
    return;
  }

  const scaleType = scale.type,
      domain = scale._domain,
      range  = scale.range;

  // Only recompute layout for ordinal scales and if they're affecting the
  // width/height.
  if (scaleType !== 'ordinal' || (range !== 'width' && range !== 'height')) {
    return;
  }

  const distinct = domain.reduce(function(count, d) {
    return count + dl.count.distinct(dsUtils.output(d.data), dl.$(d.field));
  }, 0);

  const size = scene.get(range),
      minSize = (distinct + 1) * defaultConfig.scale.minBandSize;

  if (size < minSize) {
    resize(dispatch, state, scene, range, minSize);
  }
};


function resize(dispatch : Dispatch, state : State, mark, prop : string, size) {
  if (mark.get(prop)) { // Scene
    dispatch(updateMarkProperty({property: prop, value: size}, mark.get('_id')));
  } else {
    // TODO: check all spatial properties of groups rather than just width/height.
    const updatePath = 'encode.update.',
        propPath = updatePath + prop,
        signal = getIn(mark, propPath + '.signal');

    // Don't update width/height if they're determined by data (i.e., only if
    // a signal is found).
    if (signal) {
      dispatch(setSignal(signal, size));
    }
  }

  const children = mark.get('marks');
  if (children && children.size) {
    children.forEach(function(childId) {
      const child = getInVis(state, 'marks.' + childId);
      if (child.get('type') !== 'group' && !child.get('_manualLayout')) {
        return;
      }

      resize(dispatch, state, child, prop, size);
    });
  }
}
