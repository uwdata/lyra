/* eslint new-cap:0, no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var Immutable = require('immutable');

var actions = require('../constants/actions');
var vegaReducer = require('./vega');

describe('vega reducer', function() {
  var initialState;

  beforeEach(function() {
    initialState = Immutable.Map();
  });

  it('is a function', function() {
    expect(vegaReducer).to.be.a('function');
  });

  it('returns a map with invalid and isParsing keys if state is undefined', function() {
    var result = vegaReducer();
    expect(Immutable.Map.isMap(result)).to.be.true;
    expect(result.size).to.equal(2);
    expect(result.toJS()).to.deep.equal({
      invalid: false,
      isParsing: false
    });
  });

  it('does not mutate the state if an unrelated action is passed in', function() {
    var result = vegaReducer(initialState, {
      type: 'NOT_A_RELEVANT_ACTION'
    });
    expect(initialState).to.equal(result);
  });

  describe('invalidate action', function() {

    it('can set the invalid flag on the store', function() {
      var result = vegaReducer(initialState, {
        type: actions.VEGA_INVALIDATE,
        value: true
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('can clear the invalid flag on the store', function() {
      var result = vegaReducer(initialState, {
        type: actions.VEGA_INVALIDATE,
        value: false
      });
      expect(result.get('invalid')).to.equal(false);
    });

  });

  describe('implicitly invalidating actions', function() {

    it('flags the store as invalid when a mark is added', function() {
      var result = vegaReducer(initialState, {
        type: actions.PRIMITIVE_ADD_MARK
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a mark is removed', function() {
      var result = vegaReducer(initialState, {
        type: actions.PRIMITIVE_DELETE_MARK
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a signal is initialized', function() {
      var result = vegaReducer(initialState, {
        type: actions.SIGNAL_INIT
      });
      expect(result.get('invalid')).to.equal(true);
    });

    it('flags the store as invalid when a scene is created', function() {
      var result = vegaReducer(initialState, {
        type: actions.CREATE_SCENE
      });
      expect(result.get('invalid')).to.equal(true);
    });

  });

  describe('parse action', function() {

    it('can set the isParsing flag on the store', function() {
      var result = vegaReducer(initialState, {
        type: actions.VEGA_PARSE,
        value: true
      });
      expect(result.get('isParsing')).to.equal(true);
    });

    it('can clear the isParsing flag on the store', function() {
      var result = vegaReducer(initialState, {
        type: actions.VEGA_PARSE,
        value: false
      });
      expect(result.get('isParsing')).to.equal(false);
    });

  });

});
