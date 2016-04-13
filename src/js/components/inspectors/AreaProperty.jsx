'use strict';
var dl = require('datalib'),
    React = require('react'),
    Property = require('./Property'),
    addVegaReparseRequest = require('../mixins/addVegaReparseRequest');

var EXTENTS = {
  x: {
    start: {name: 'x', label: 'Left'},
    center: {name: 'xc', label: 'Center'},
    span: {name: 'width', label: 'Width'},
    end: {name: 'x2', label: 'Right'}
  },
  y: {
    start: {name: 'y', label: 'Top'},
    center: {name: 'yc', label: 'Middle'},
    span: {name: 'height', label: 'Height'},
    end: {name: 'y2', label: 'Bottom'}
  }
};

var AreaProperty = React.createClass({

  getInitialState: function() {
    return this.extents();
  },

  componentWillReceiveProps: function() {
    this.setState(this.extents());
  },

  extents: function() {
    var props = this.props,
        type = props.type,
        primitive = props.primitive,
        update = primitive.properties.update,
        extents = dl.vals(EXTENTS[type]),
        start, end;

    extents.forEach(function(x) {
      var name = x.name,
          prop = update[name];

      if (prop._disabled) {
        return;
      } else if (!start) {
        start = name;
      } else if (start !== name) {
        end = name;
      }
    });

    return {start: start, end: end};
  },

  render: function() {
    var state = this.state,
        props = this.props,
        primitive = props.primitive,
        update = primitive.properties.update,
        start = state.start,
        end = state.end;

    return (
      <div>
        <Property
          name={start}
          type="number"
          primitive={primitive}
          canDrop={true}
          disabled={update[start].band || update[start].group}
          >
          <div className="label">
            Start
          </div>
        </Property>

        <Property
          name={end}
          type="number"
          primitive={primitive}
          canDrop={true}
          disabled={update[end].band || update[end].group}
          >
          <div className="label">
            End
          </div>
        </Property>
      </div>
    );
  }
});

module.exports = addVegaReparseRequest(AreaProperty);
