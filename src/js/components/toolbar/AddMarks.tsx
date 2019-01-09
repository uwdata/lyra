import * as React from 'react';
import { connect } from 'react-redux';
import { State } from '../../store';

const Mark = require('../../store/factory/Mark');
const getClosestGroupId = require('../../util/hierarchy').getClosestGroupId;
const addMark = require('../../actions/markActions').addMark;
const assets = require('../../util/assets');
const Icon = require('../Icon');
const propTypes = require('prop-types');

function mapStateToProps(reduxState: State) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    addMark: (type: string) => {
      const newMarkProps = Mark(type, {
        _parent: getClosestGroupId()
      });
      dispatch(addMark(newMarkProps));
    }
  };
}

// Currently supported mark types
const marksArray = ['rect', 'symbol', 'text', 'line', 'area'];

interface AddMarksToolProps {
  addMark: (type: string) => void;
}

class AddMarksTool extends React.Component<AddMarksToolProps> {
  public static propTypes = {
    addMark: propTypes.func
  };
  public classNames: 'new-marks';
  public render() {
    return (
      <ul>
        {marksArray.map(function(markType, i) {
          return (
            <li
              key={markType}
              onClick={this.props.addMark.bind(null, markType)}
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
  mapStateToProps,
  mapDispatchToProps
)(AddMarksTool);
