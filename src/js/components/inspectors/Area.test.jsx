/* eslint no-unused-expressions:0 */
'use strict';

var expect = require('chai').expect;
var React = require('react');
var enzyme = require('enzyme');
var Area = require('./Area');
var Property = require('./Property');
var wrapper;

// this is shallow rendered tested since all the work is done in property.js
describe('Area Inspector <Area/> (shallow)', function() {
  beforeEach(function() {
    var mock = {
      from: {
        data: 'dummy_data_area'
      },
      properties: {
        update: {
          x2: {value: 0},
          y2: {value: 0},
          xc: {value: 60, _disabled: true},
          yc: {value: 60, _disabled: true},
          tension: {value: 13},
          interpolate: {value: 'monotone'},
          fill: {value: '#55498D'},
          fillOpacity: {value: 1},
          stroke: {value: '#55498D'},
          strokeWidth: {value: 0.25},
          orient: {value: 'vertical'},
          width: {value: 30, _disabled: true},
          height: {value: 30, _disabled: true}
        }
      }
    };
    wrapper = enzyme.shallow(<Area primitive={mock}/>);
  });

  it('renders as a <div>', function() {
    expect(wrapper.type()).to.eql('div');
  });

  it('it should render 7 <Property/> components', function() {
    expect(wrapper.find(Property)).to.have.length(9);
  });

  it('it should render 6 h3 tags', function() {
    expect(wrapper.find('h3')).to.have.length(5);
  });
});


