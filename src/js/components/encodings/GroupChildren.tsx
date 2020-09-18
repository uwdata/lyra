import * as React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip'
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {selectMark, toggleLayers, InspectorSelectedType} from '../../actions/inspectorActions';
import {deleteMark, updateMarkProperty} from '../../actions/markActions';
import {State} from '../../store'
import {ExpandedLayers} from '../../store/factory/Inspector';
import {GroupRecord} from '../../store/factory/marks/Group';
import { Icon } from '../Icon';
import GuideList from './GuideList';
import MarkList from './MarkList';
import InteractionList from './InteractionList';
import WidgetList from './WidgetList';

const ContentEditable = require('../ContentEditable');
const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
const assets = require('../../util/assets');

interface OwnProps {
  id?: number;
  selectedId: number;
  selectedType: InspectorSelectedType;
  sceneId: number;
}

interface StateProps {
  expandedLayers?: ExpandedLayers;
  group: GroupRecord;
}

interface DispatchProps {
  selectGroup: () => void;
  deleteGroup: (evt) => void;
  updateName: (value: string) => void;
  toggleGroup?: () => void;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  return {
    expandedLayers: reduxState.getIn(['inspector', 'encodings', 'expandedLayers']),
    group: getInVis(reduxState, 'marks.' + ownProps.id)
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>, ownProps: OwnProps): DispatchProps {
  return {
    selectGroup: function() {
      dispatch(selectMark(ownProps.id));
    },

    deleteGroup: function(evt) {
      const id = ownProps.id;
      if (ownProps.selectedId === id) {
        dispatch(selectMark(ownProps.sceneId));
      }
      dispatch(deleteMark(id));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },

    updateName: function(value) {
      dispatch(updateMarkProperty({property: 'name', value}, ownProps.id));
    },

    toggleGroup: function() {
      dispatch(toggleLayers([ownProps.id]));
    }
  };
}

class Group extends React.Component<OwnProps & StateProps & DispatchProps> {

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const props = this.props;
    const id = props.id;
    const group = props.group;
    const name  = group.name;
    const isExpanded = props.expandedLayers[id];
    const groupClass = isExpanded ? 'expanded' : 'contracted';

    return (
      <li className={groupClass}>
        <div className={'name' + (props.selectedId === id && props.selectedType === InspectorSelectedType.SELECT_MARK ? ' selected' : '')}
          onClick={props.selectGroup}>

          <Icon glyph={assets['group-' + groupClass]} onClick={props.toggleGroup} />

          <ContentEditable value={name} save={props.updateName}
            onClick={props.selectGroup} />

          <Icon glyph={assets.trash} className='delete'
            onClick={props.deleteGroup} data-html={true} data-place='right'
            data-tip={'Delete ' + name + ' and <br> everything inside it'} />
        </div>

        {isExpanded && group.get('marks') ? (
          <ul className='group'>
            <GuideList groupId={id} {...props} />
            <MarkList groupId={id} {...props} />
            <InteractionList groupId={id} {...props} />
            <WidgetList groupId={id} {...props} />
          </ul>
        ) : null}
      </li>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Group);
