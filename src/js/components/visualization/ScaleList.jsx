'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    ContentEditable = require('../ContentEditable');

function mapStateToProps(reduxState, ownProps) {
  return {
    selected: getIn(reduxState, 'selectedMark')
  };
}

var ScaleList = connect(
  mapStateToProps
)(React.createClass({
  propTypes: {
    select: React.PropTypes.func,
    selected: React.PropTypes.number
  },
  render: function() {
    var props = this.props,
        selected = props.selected;
    return (
      <div id="scale-list" className="expandingMenu">
        <h4 className="hed-tertiary">
          Scales
          <i className="fa fa-plus"
            data-tip="Add a new scale."
            data-place="right"
          ></i>
        </h4>
        <ul>
          {props.scales.map(function(scale) {
            var id = scale._id;
            return (
              <li key={id} className={selected === id ? 'selected' : ''}>
                <div className="scale name">
                  <ContentEditable obj={scale} prop="name"
                    value={scale.name}/>
                </div>
              </li>
            );
          }, this)}
        </ul>
      </div>
    );
  }
}));

module.exports = ScaleList;
