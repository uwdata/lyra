import * as React from 'react';
import { connect } from 'react-redux';
import {addMark} from '../../actions/markActions';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import {startDragging, stopDragging} from '../../actions/inspectorActions';
import {DraggingStateRecord, MarkDraggingState} from '../../store/factory/Inspector';
import { Icon } from '../Icon';
import {getClosestGroupId} from '../../util/hierarchy';

const assets = require('../../util/assets');

// Currently supported mark types
// TODO don't repeat this list across the codebase
const marksArray = ['rect', 'symbol', 'text', 'line', 'area'];

interface DispatchProps {
  addMark: (type: LyraMarkType) => void;
  startDragging: (d: DraggingStateRecord) => void;
  stopDragging: () => void;
}

function mapDispatchToProps(dispatch, ownProps): DispatchProps {
  return {
    addMark: (type) => {
      const parentId = getClosestGroupId();
      if (parentId === 1) {
        // parent is scene. don't add marks directly to the scene (marks should be under a group)
        return;
      }
      const newMarkProps = Mark(type, {
        _parent: parentId
      });
      dispatch(addMark(newMarkProps));
    },
    startDragging: (d: DraggingStateRecord) => { dispatch(startDragging(d)); },
    stopDragging: () => { dispatch(stopDragging()); },
  };
}

class AddMarksTool extends React.Component<DispatchProps> {

  public classNames: 'new-marks';

  public handleClick = (evt: React.DragEvent<HTMLDivElement>, mark) => {
    console.log("click");
    this.props.addMark(mark);

  }
  public handleDragStart = (evt, mark) => {
    console.log("drag start");
    this.props.startDragging(MarkDraggingState({mark}));
  }

  // This makes use of the bubble cursor, which corresponds to the cell signal;
  // we're using that to figure out which channel we are closest to. The
  // SELECTED signal indicates the mark to bind the data to.
  public handleDragEnd = (evt: React.DragEvent<HTMLDivElement>, opts?) => {
    this.props.stopDragging();

  }

  public render() {
    return (
      <ul className='add-marks'>
        {marksArray.map(function(markType, i) {
          return (
            <li draggable={true}
              key={markType}
              onClick={(e) => {this.handleClick(e, markType)}}
              onDragStart={(e) => {this.handleDragStart(e, markType)}}
              onDragEnd={this.handleDragEnd}
            >
              <Icon glyph={assets[markType]} /> {markType}
            </li>
          );
        }, this)}
      </ul>
    );
  }
}

export const AddMarks = connect(
  null,
  mapDispatchToProps
)(AddMarksTool);
