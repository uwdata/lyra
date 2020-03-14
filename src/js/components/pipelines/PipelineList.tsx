import {Map} from 'immutable';
import * as React from 'react';
import {connect} from 'react-redux';
import {selectPipeline} from '../../actions/inspectorActions';
import {updatePipelineProperty as updatePipeline} from '../../actions/pipelineActions';
import {State} from '../../store';
import {PipelineRecord} from '../../store/factory/Pipeline';
import {Icon} from '../Icon';
import {PipelineInspector} from './PipelineInspector';

const getInVis = require('../../util/immutable-utils').getInVis;
const ContentEditable = require('../ContentEditable');
const assets = require('../../util/assets');

interface OwnProps {
  openModal: () => void;
}
interface StateProps {
  pipelines: Map<number, PipelineRecord>;
  selectedId: number;
}

interface DispatchProps {
  selectPipeline: (id: number) => void;
  updatePipeline: (payload: {property: string, value: any}, id: number) => void;
}

function mapState(state: State): StateProps {
  return {
    pipelines: getInVis(state, 'pipelines'),
    selectedId: state.getIn(['inspector', 'pipelines', 'selectedId'])
  };
}

const mapDispatch: DispatchProps = {
  selectPipeline,
  updatePipeline
};

class BasePipelineList extends React.Component<OwnProps & StateProps & DispatchProps> {
  public render() {
    const pipelineIds = this.props.pipelines.keySeq().toArray();
    const pipelines = this.props.pipelines.valueSeq().toArray();

    const selectedId = this.props.selectedId ? this.props.selectedId : (pipelineIds.length ? pipelineIds[0] : this.props.selectedId);

    return (
      <div id='pipeline-list' style={{marginTop: pipelines.length ? -20 : -15}}>
        <div className='pipeline-tabs'>
          {
            pipelines.length ?
              pipelines.map((pipeline) => {
                const id = pipeline._id;
                const name = pipeline.name;
                return (
                  <ContentEditable key={id} className={'header ' + (selectedId === id ? 'selected' : '')}
                  value={name}
                  save={this.props.updatePipeline.bind(this, id, 'name')}
                  onClick={() => this.props.selectPipeline(id)} />
                );
              }) : null
          }

          <span className='new' onClick={this.props.openModal}>
            <Icon glyph={assets.plus} /> New
          </span>
        </div>
        {
          pipelineIds.length ?
            pipelineIds.map((id) => {
              return (<PipelineInspector key={id} id={id} selectedId={selectedId} />);
            }) :
            <div id='pipeline-hint' onClick={this.props.openModal}>
              Add a new data pipeline to get started.
            </div>
        }
      </div>
    );
  }
}

export const PipelineList = connect(mapState, mapDispatch)(BasePipelineList);
