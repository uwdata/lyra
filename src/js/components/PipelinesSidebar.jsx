'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../util/immutable-utils').getIn,
    PipelineList = require('./pipelines/PipelineList'),
    assets = require('../util/assets'),
    Icon = require('./Icon'),
    model = require('../model');

function mapStateToProps(reduxState) {
  var pipelines = getIn(reduxState, 'pipelines');
  return {
    pipelines: pipelines
  };
}

var PipelineSidebar = React.createClass({
  render: function() {
    return (
      <div className="sidebar" id="pipeline-sidebar">
        <h2>Data Pipelines
          <span className="new" onClick={null}>
            <Icon glyph={assets.plus} /> New
          </span>
        </h2>

        <PipelineList pipelines={this.props.pipelines} />
      </div>
    );
  }
});

module.exports = connect(mapStateToProps)(PipelineSidebar);
