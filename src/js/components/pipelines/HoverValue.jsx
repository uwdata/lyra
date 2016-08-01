'use strict';
var React = require('react'),
    d3 = require('d3');

var HoverValue = React.createClass({
  propTypes: {
    event: React.PropTypes.object,
    scrollLeft: React.PropTypes.number
  },

  render: function() {
    var props = this.props,
        evt = props.event;

    if (!evt) {
      return null;
    }

    var target = d3.select(evt.target),
        node   = target.node(),
        field  = node.parentNode.firstChild,
        rect = field.getBoundingClientRect(),
        left = field.offsetLeft + rect.width,
        altClass = target.classed('odd') ? 'odd' : 'even';

    var style = {
      display: 'block',
      left: node.offsetLeft - props.scrollLeft + left,
      top: field.offsetTop
    };

    return (
      <div className={'full value ' + altClass} style={style}>
        {target.text()}
      </div>
    );
  }
});

module.exports = HoverValue;
