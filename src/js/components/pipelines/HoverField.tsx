import * as React from 'react';
import {connect} from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import * as vega from 'vega';
import bindChannel from '../../actions/bindChannel';
import sg from '../../ctrl/signals';
import {State} from '../../store';
import {ColumnRecord, Schema} from '../../store/factory/Dataset';
import {CELL, MODE, SELECTED} from '../../store/factory/Signal';
import duplicate from '../../util/duplicate';
import {Icon} from '../Icon';
import AggregateList from './AggregateList';
import FieldType from './FieldType';
import FilterIcon from './transforms/FilterIcon';
import FormulaIcon from './transforms/FormulaIcon';
import SortIcon from './transforms/SortIcon';

const ctrl = require('../../ctrl');

const getInVis = require('../../util/immutable-utils').getInVis;
const assets = require('../../util/assets');
const QUANTITATIVE = require('../../constants/measureTypes').QUANTITATIVE;

const tupleid = (vega as any).tupleid; // TODO: remove when vega/vega#1947 is merged.

interface OwnProps {
  dsId: number;
  def: HoverFieldDef;
  schema: Schema;
}

interface StateProps {
  srcId: number;
}

interface DispatchProps {
  bindChannel: (dsId: number, field: ColumnRecord, markId: number, property: string) => void;
}

interface OwnState {
  fieldDef:  ColumnRecord;
  offsetTop: number;
  bindField: ColumnRecord;
  showAggregates: boolean;
}

export interface HoverFieldDef {
  name: string,
  offsetTop: number
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    srcId: getInVis(state, 'pipelines.' +
      getInVis(state, 'datasets.' + ownProps.dsId + '._parent') + '._source')
  };
}

const actionCreators = {bindChannel};

class HoverField extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      fieldDef:  null,
      offsetTop: null,
      bindField: null,
      showAggregates: false
    };
  }

  public componentWillReceiveProps(newProps: OwnProps) {
    const def = newProps.def;
    const schema = newProps.schema;

    this.setState((currentState) => {
      if (!def) {
        return {...currentState, fieldDef: null, showAggregates: false};
      } else {
        return {...currentState, fieldDef: schema.get(def.name), offsetTop: def.offsetTop, showAggregates: false};
      }
    });
  }

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public handleDragStart = (evt) => {
    const classList = evt.target.classList;
    this.setState((currentState) => {
      // if an AggregateField isn't being dragged, close the menu
      if (!classList.contains('aggregate-field')) {
        return {...currentState, bindField: duplicate(this.state.fieldDef), showAggregates: false}
      }
      else {
        return {...currentState, bindField: duplicate(this.state.fieldDef)};
      }
    });

    evt.dataTransfer.setData('dsId', this.props.dsId);
    evt.dataTransfer.setData('fieldDef', JSON.stringify(this.state.fieldDef.toJS()));
    evt.dataTransfer.effectAllowed = 'link';
    sg.set(MODE, 'channels');
    ctrl.update();
  }

  // This makes use of the bubble cursor, which corresponds to the cell signal;
  // we're using that to figure out which channel we are closest to. The
  // SELECTED signal indicates the mark to bind the data to.
  public handleDragEnd = (evt: React.DragEvent<HTMLDivElement>, opts?) => {
    const props = this.props;
    const sel = sg.get(SELECTED);
    const cell = sg.get(CELL);
    const bindField = this.state.bindField;
    const dropped = tupleid(sel) && tupleid(cell);
    const dsId = bindField.source ? props.srcId : props.dsId;

    try {
      if (dropped) {
        const lyraId = +sel.mark.role.split('lyra_')[1];
        vega.extend(bindField, opts); // Aggregate or Bin passed in opts.
        props.bindChannel(dsId, bindField, lyraId, cell.key);
      }
    } catch (e) {
      console.error('Unable to bind primitive');
      console.error(e);
    }

    sg.set(MODE, 'handles');
    sg.set(CELL, {});
    this.setState({bindField: null});

    if (!dropped) {
      ctrl.update();
    }
  }

  public toggleTransforms = (evt) => {
    this.setState({showAggregates: !this.state.showAggregates});
  }

  public render() {
    const dsId  = this.props.dsId;
    const state = this.state;
    const elem  = document.querySelector('.field.source');
    const size  = elem ? elem.getBoundingClientRect() : {height: 1, width: 1};
    const field = state.fieldDef;
    const fieldStyle = {
      top: state.offsetTop,
      display: field ? 'block' : 'none'
    };
    const listStyle  = {
      top: state.offsetTop,
      display: field && state.showAggregates ? 'block' : 'none'
    };
    const bufferStyle = {
      display: fieldStyle.display,
      top: state.offsetTop - 18,
      height: size.height + 26,
      width: 2 * size.width
    };
    const dragHandlers = {
      onDragStart: this.handleDragStart,
      onDragEnd: this.handleDragEnd
    };

    const fieldEl = field ? (
      <div>
        <FieldType dsId={dsId} field={field} />
        {field.mtype === QUANTITATIVE ? (
          <Icon onClick={this.toggleTransforms} glyph={assets.aggregate}
            width='10' height='10' data-tip='Show aggregations' />
        ) : null}
        <span className='fieldName'>{field.name}</span>

        <FilterIcon dsId={dsId} field={field}/>
        <FormulaIcon dsId={dsId} field={field}/>
        {/* <SortIcon dsId={dsId} field={field} /> */}
      </div>
    ) : null;

    return (
      <div onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd}>
        <div className='buffer full' style={bufferStyle} />

        <div style={fieldStyle} draggable={true}
          className={'full field ' + (field && field.source ? 'source' : 'derived')}>{fieldEl}</div>

        <AggregateList handlers={dragHandlers} style={listStyle}
          field={field} {...this.props} />
      </div>
    );
  }
}

export default connect(mapStateToProps, actionCreators)(HoverField);
