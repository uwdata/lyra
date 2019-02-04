'use strict';

var React = require('react'),
    Property = require('./Property'),
    ExtentProperty = require('./ExtentProperty'),
    primTypes = require('../../constants/primTypes'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

var RectInspector = createReactClass({
  propTypes: {
    primId: propTypes.number.isRequired,
    primType: primTypes.isRequired
  },
  render: function() {
    var props = this.props;
    return (
      <div>
        <div className="property-group">
          <h3>X Position</h3>

          <ExtentProperty exType="x" {...props} />
        </div>

        <div className="property-group">
          <h3>Y Position</h3>

          <ExtentProperty exType="y" {...props} />
        </div>

        <div className="property-group">
          <h3>Fill</h3>

          <Property name="fill" label="Color" type="color"
            canDrop={true} {...props} />

          <Property name="fillOpacity" label="Opacity" type="range"
            min="0" max="1" step="0.05" canDrop={true} {...props} />
        </div>

        <div className="property-group">
          <h3>Stroke</h3>

          <Property name="stroke" label="Color" type="color"
            canDrop={true} {...props} />

          <Property name="strokeWidth" label="Width" type="range"
            min="0" max="10" step="0.25" canDrop={true} {...props} />
        </div>
      </div>
    );
  }
});

module.exports = RectInspector;
