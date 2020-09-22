'use strict';
const INTERPOLATE = require('../../constants/interpolate');

import * as React from 'react';
import {connect} from 'react-redux';
import {PrimType} from '../../constants/primTypes';
import {Property} from './Property';

const Area = {
  'ORIENT': [
    'vertical',
    'horizontal'
]};

interface AreaProps {
  primId: number,
  primType: PrimType
}

class BaseArea extends React.Component<AreaProps> {
  public render() {
    const props = this.props;
    return (
      <div>
        <div className="property-group">
          <h3>Orientation</h3>

          <Property name="orient" label="Orient" type="select"
            opts={Area.ORIENT} {...props} />
        </div>

        <Property name='x' type='number' droppable={true} {...props}>
          <h3 className='label'>X Position</h3>
        </Property>

        <div className='property-group'>
          <h3>Y Position</h3>

          <Property name='y' label='Start' type='number' droppable={true} {...props} />

          <Property name='y2' label='End' type='number' droppable={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Fill</h3>

          <Property name='fill' label='Color' type='color'
            droppable={true} {...props} />

          <Property name='fillOpacity' label='Opacity' type='range'
            min='0' max='1' step='0.05' droppable={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Stroke</h3>

          <Property name='stroke' label='Color' type='color'
            droppable={true} {...props} />

          <Property name='strokeWidth' label='Width' type='range'
            min='0' max='10' step='0.25' droppable={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Line Strength</h3>

          <Property name='interpolate' label='Interpolate' type='select'
            opts={INTERPOLATE} droppable={true} {...props} />

          <Property name='tension' label='Tension' type='number'
            droppable={true} {...props} />
        </div>
      </div>
    );
  }
};
export const AreaInspector = connect()(BaseArea);
