'use strict';

import * as React from 'react';
import { connect } from 'react-redux';
import {Transforms} from 'vega';
import {State} from '../../../store';
import TransformInspector from './TransformInspector';

const getInVis = require('../../../util/immutable-utils').getInVis;

interface OwnProps {
  dsId: number;
}
interface StateProps {
  transforms: Transforms[];
}

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {
    transforms: getInVis(state, 'datasets.' + ownProps.dsId + '.transform')
  };
}

interface OwnState {
  expandedIndex: number;
}

class TransformList extends React.Component<OwnProps & StateProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      expandedIndex: null
    }
  }

  private setExpandedIndex(expandedIndex) {
    this.setState({
      expandedIndex
    })
  }

  public render() {
    const props = this.props;
    const transforms = props.transforms;
    const aggregate  = transforms ? transforms.length === 1 &&
          transforms[0].type === 'aggregate' : false;
    const dsId = props.dsId;

    return transforms && !aggregate ? (
      <div className='transform-list'>
        {transforms.map(function(transform, i) {
          return transform.type === 'aggregate' || transform.type === 'identifier' ? null : (
            <TransformInspector key={i} index={i} dsId={dsId} def={transform} expanded={this.state.expandedIndex == i} setExpandedIndex={(i) => this.setExpandedIndex(i)} />
          );
        }, this)}
      </div>
    ) : null;
  }
}

export default connect(mapStateToProps)(TransformList);
