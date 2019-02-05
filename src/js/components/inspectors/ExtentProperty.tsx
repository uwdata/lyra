'use strict';
const dl = require('datalib');
const markActions = require('../../actions/markActions');
const setMarkExtent = markActions.setMarkExtent;
const resetMarkVisual = markActions.resetMarkVisual;
const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;
const MARK_EXTENTS = require('../../constants/markExtents');

import * as React from 'react';
import {connect} from 'react-redux';
import {Property} from './Property';
import {SpatialPreset} from './SpatialPreset';

function mapStateToProps(state, ownProps) {
  const type = ownProps.exType;
  const primId = ownProps.primId;
  const mark = getInVis(state, 'marks.' + primId + '.properties.update');
  const EXTENTS = dl.vals(MARK_EXTENTS[type]);
  let start;
  let end;

  EXTENTS.forEach(function(ext) {
    const name = ext.name;
    const prop = mark.get(name);
    if (prop.get('_disabled')) {
      return;
    } else if (!start) {
      start = name;
    } else if (start !== name) {
      end = name;
    }
  });

  return {
    start: start,
    end: end,
    startDisabled: getIn(mark, start + '.band') || getIn(mark, start + '.group'),
    endDisabled: getIn(mark, end + '.band') || getIn(mark, end + '.group'),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    setExtent: function(oldExtent, newExtent) {
      const markId = ownProps.primId;
      dispatch(setMarkExtent(markId, oldExtent, newExtent));
      dispatch(resetMarkVisual(markId, newExtent));
    }
  };
}

interface ExtentPropProps {
  exType: any;
  end: any;
  setExtent: any;
  start: any;
  startDisabled: any;
  endDisabled: any;
  primId: any;
}
class BaseExtentProperty extends React.Component<ExtentPropProps> {
  public handleChange(evt) {
    const props = this.props;
    const type = props.exType;
    const target = evt.target;
    const name = target.name;
    const newExtent = target.value;
    const oldExtent = props[name];
    const EXTENTS = MARK_EXTENTS[type];
    const center = EXTENTS.CENTER.name;
    const span = EXTENTS.SPAN.name;
    const oldEnd = props.end;

    props.setExtent(oldExtent, newExtent);

    if (newExtent === center && oldEnd !== span) {
      props.setExtent(oldEnd, span);
    }
  };

  public render() {
    const props = this.props;
    const type = props.exType;
    const EXTENTS = MARK_EXTENTS[type];
    const center = EXTENTS.CENTER.name;
    const span = EXTENTS.SPAN.label;
    const opts = dl.vals(EXTENTS);
    const start = props.start;
    const end = props.end;

    return (
      <div>
        <Property name={start} type='number' canDrop={true} firstChild={true}
          disabled={props.startDisabled} {...props}>

          <div className='label-long label'>
            <select name='start' value={start} onChange={this.handleChange}>
              {opts
                .filter(function(x) {
                  return x.name !== end;
                })
                .map(function(x) {
                  return (<option key={x.name} value={x.name}>{x.label}</option>);
                })}
            </select>
          </div>

          <SpatialPreset className='extra' name={start} {...props} />
        </Property>

        <Property name={end} type='number' canDrop={true} firstChild={true}
          disabled={props.endDisabled} {...props}>

          <br />

          <div className='label-long label'>
            {start === center ?
              (<label htmlFor='end'>{span}</label>) :
              (
                <select name='end' value={end} onChange={this.handleChange}>
                  {opts
                    .filter(function(x) {
                      return x.name !== start && x.name !== center;
                    })
                    .map(function(x) {
                      return (<option key={x.name} value={x.name}>{x.label}</option>);
                    })}
                </select>
              )
            }
          </div>

          <SpatialPreset className='extra' name={end} {...props} />
        </Property>
      </div>
    );
  }
};
export const ExtentProperty = connect(mapStateToProps, mapDispatchToProps)(BaseExtentProperty);
