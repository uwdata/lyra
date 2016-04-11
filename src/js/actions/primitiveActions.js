'use strict';
var actions = require('../constants/actions');
var PRIMITIVE_ADD_MARK = actions.PRIMITIVE_ADD_MARK;
var PRIMITIVE_SET_PARENT = actions.PRIMITIVE_SET_PARENT;
var counter = require('../util/counter');
var markName = require('../util/markName');
var assign = require('object-assign');

// We pull in all of the mark constructors purely to access their static
// `.getHandleStreams` and `.defaultProperties` methods
var marks = require('../model/primitives/marks');

/**
 * Action creator to create a new mark and add it to the store. (This creator is
 * intended for use with marks, and not other primitives like scales or axes.)
 * @param {Object} primitiveProps - The properties of the primitive to create
 * @returns {Object} The PRIMITIVE_ADD_MARK action object
 */
function addMark(primitiveProps) {
  var props = assign({
    _id: primitiveProps._id || counter.global(),
    name: primitiveProps.name || markName(primitiveProps.type)
  }, primitiveProps);
  var action = {
    id: props._id,
    name: props.name,
    type: PRIMITIVE_ADD_MARK,
    props: props,
    streams: marks.getHandleStreams(props)
  };
  console.log(action.id);
  return action;
}

/**
 * Action creator to mark one existing primitive as the child of another.
 * @param {number} childId - The child primitive's ID
 * @param {number} parentId - The parent primitive's ID
 * @returns {Object} The PRIMITIVE_SET_PARENT action object
 */
function setParent(childId, parentId) {
  return {
    type: PRIMITIVE_SET_PARENT,
    childId: childId,
    parentId: parentId
  };
}

module.exports = {
  addMark: addMark,
  setParent: setParent
};
