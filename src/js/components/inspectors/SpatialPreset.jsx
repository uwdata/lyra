'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    propSg = require('../../util/prop-signal'),
    model = require('../../model'),
    lookup = model.lookup,
    reparse = require('../../actions/reparse');

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    reparse: function() {
      dispatch(reparse(true));
    }
  };
}

var SpatialPreset = React.createClass({

  handleChange: function(evt) {
    var props = this.props,
        primitive = props.primitive,
        target = evt.target,
        name = target.name,
        update = primitive.properties.update,
        prop = update[name],
        scale = prop.scale && lookup(prop.scale),
        preset = name.indexOf('x') >= 0 ? 'width' : 'height';

    if (evt.target.checked) {
      update[name] = (name === 'width' || name === 'height') ? {
        scale: scale,
        band: true
      } : {
        group: preset
      };
    } else {
      update[name] = {
        signal: propSg(primitive, name)
      };
    }

    this.props.reparse();
  },

  render: function() {
    var props = this.props,
        name = props.name,
        primitive = this.props.primitive,
        update = primitive.properties.update,
        prop = update[name],
        scale = prop.scale && lookup(prop.scale),
        preset = name.indexOf('x') >= 0 ? 'Width' : 'Height';

    if (prop.field) {
      return null;
    }

    if (name === 'width' || name === 'height') {
      return (scale && scale.type === 'ordinal' && !scale.points) ? (
        <label>
          <input type="checkbox" name={name} checked={prop.band}
            onChange={this.handleChange} /> Automatic
        </label>
      ) : null;
    }

    return (
      <label>
        <input type="checkbox" name={name} checked={prop.group}
          onChange={this.handleChange} /> Group {preset}
      </label>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(SpatialPreset);
