/* eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;

var actions = require('../constants/actions');
var invalidateVega = require('./invalidateVega');

describe('invalidateVega action creator', function() {

  it('returns an object', function() {
    var result = invalidateVega('');
    expect(result).to.be.an('object');
  });

  it('sets the correct signal type', function() {
    var result = invalidateVega('');
    expect(result).to.have.property('type');
    expect(result.type).to.equal(actions.INVALIDATE_VEGA);
  });

  it('sets the provided value on the action object', function() {
    var result = invalidateVega(true);
    expect(result).to.have.property('value');
    expect(result.value).to.be.true;
    result = invalidateVega(false);
    expect(result).to.have.property('value');
    expect(result.value).to.be.false;
  });

  it('coerces the provided value to a boolean', function() {
    var result = invalidateVega(1);
    expect(result).to.have.property('value');
    expect(result.value).to.be.true;
    result = invalidateVega(0);
    expect(result).to.have.property('value');
    expect(result.value).to.be.false;
  });

});
