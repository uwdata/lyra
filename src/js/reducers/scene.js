/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');

function sceneReducer(state, action) {
  if (typeof state === 'undefined') {
    return Immutable.Map();
  }

  if (action.type === actions.CREATE_SCENE) {
    return state.set('id', action.id);
  }

  return state;
}

module.exports = sceneReducer;
