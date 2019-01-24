import * as React from 'react';
import {AggregateHandlers} from './AggregateList';
import {FieldObject} from './FieldType';

const AGGREGATE_OPS = require('../../constants/aggregateOps');

interface OwnProps extends AggregateHandlers {
  op: any; // propTypes.oneOf(AGGREGATE_OPS).isRequired,
  field: FieldObject
}

class AggregateField extends React.Component<OwnProps> {

  public onDragEnd = (evt) => {
    const props = this.props;
    props.onDragEnd(evt, {aggregate: props.op});
  }

  public render() {
    const props = this.props;
    const field = props.field;
    const fieldName = field ? field.name : null;

    return (
      <div className={'full field derived aggregate-field'} draggable={true}
        onDragStart={props.onDragStart}
        onDragOver={props.onDragOver}
        onDragEnd={this.onDragEnd}
        onDrop={props.onDrop}>
        <strong>{props.op}</strong>_{fieldName}
      </div>
    );
  }
}

export default AggregateField;
