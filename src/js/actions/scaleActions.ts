'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_SCALE = 'ADD_SCALE',
    UPDATE_SCALE_PROPERTY = 'UPDATE_SCALE_PROPERTY',
    AMEND_DATA_REF = 'AMEND_DATA_REF',
    DELETE_SCALE = 'DELETE_SCALE';

/**
 * Action creator to create a new scale and add it to the store.
 *
 * @param {Object} scaleProps - The properties of the scale to create
 * @returns {Object} The ADD_SCALE action object
 */
function addScale(scaleProps) {
  var props = dl.extend({
    _id: scaleProps._id || counter.global(),
  }, scaleProps);

  return {
    id: props._id,
    type: ADD_SCALE,
    props: props
  };
}

function updateScaleProperty(scaleId, property, value) {
  return {
    type: UPDATE_SCALE_PROPERTY,
    id: scaleId,
    property: property,
    value: value
  };
}

function amendDataRef(scaleId, property, ref) {
  return {
    type: AMEND_DATA_REF,
    id: scaleId,
    property: property,
    ref: ref
  };
}

function deleteScale(id) {
  return {
    type: DELETE_SCALE,
    id: id
  };
}

module.exports = {
  // Action Names
  ADD_SCALE: ADD_SCALE,
  UPDATE_SCALE_PROPERTY: UPDATE_SCALE_PROPERTY,
  AMEND_DATA_REF: AMEND_DATA_REF,
  DELETE_SCALE: DELETE_SCALE,

  // Action Creators
  addScale: addScale,
  updateScaleProperty: updateScaleProperty,
  amendDataRef: amendDataRef,
  deleteScale: deleteScale
};
