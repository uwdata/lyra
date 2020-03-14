'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import { throttle } from "throttle-debounce";
import {State} from '../../store';
import {InteractionRecord, ApplicationRecord, SelectionRecord, ScaleInfo, MarkApplicationRecord, PointSelectionRecord, IntervalSelectionRecord, IntervalSelection, PointSelection, MarkApplication, ScaleApplication, TransformApplication} from '../../store/factory/Interaction';
import {GroupRecord} from '../../store/factory/marks/Group';
import {Dispatch} from 'redux';
import {setSelection, setApplication} from '../../actions/interactionActions';
import {FormInputProperty} from './FormInputProperty';
import {getScaleInfoForGroup, ScaleSimpleType} from '../../ctrl/demonstrations';
import {DatasetRecord} from '../../store/factory/Dataset';
import {InteractionMarkApplicationProperty} from './InteractionMarkApplication';
import {MarkRecord, LyraMarkType} from '../../store/factory/Mark';
import exportName from '../../util/exportName';
import {Icon} from '../Icon';
import InteractionPreview from '../interactions/InteractionPreview';
import {debounce} from 'vega';
import {Map} from 'immutable';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface OwnProps {
  primId: number;
}

interface OwnState {
  isDemonstratingInterval: boolean,
  mainViewSignalValues: {[name: string]: any}, // name -> value
}

interface DispatchProps {
  setSelection: (record: SelectionRecord, id: number) => void;
  setApplication: (record: ApplicationRecord, id: number) => void;
}

interface StateProps {
  groups: Map<number, GroupRecord>;
  interaction: InteractionRecord;
  scaleInfo: ScaleInfo;
  datasets: Map<string, DatasetRecord>;
  group: GroupRecord;
  groupName: string;
  marksOfGroups: Map<number, MarkRecord[]>; // map of group ids to array of mark specs
  fieldsOfGroup: string[];
  canDemonstrate: boolean;
  selectionPreviewsPoint: SelectionRecord[];
  selectionPreviewsInterval: SelectionRecord[];
  applicationPreviewsPoint: ApplicationRecord[];
  applicationPreviewsInterval: ApplicationRecord[];
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const interaction: InteractionRecord = state.getIn(['vis', 'present', 'interactions',  String(ownProps.primId)]);
  const groupId = interaction.get('groupId');
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, groupId);
  const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groupId)]);
  const groupName = exportName(group.name);

  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups: Map<number, GroupRecord> = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).mapEntries(([k, v]) => {
    return [Number(k), v as GroupRecord];
  });

  const marksOfGroups: Map<number, MarkRecord[]> = groups.map(group => {
    return group.marks.map(markId => {
      return state.getIn(['vis', 'present', 'marks', String(markId)]);
    }).filter((mark) => {
      return !(mark.type === 'group' || mark.name.indexOf('lyra') === 0);
    });
  });

  const marksOfGroup = marksOfGroups.get(groupId);

  const datasets: Map<string, DatasetRecord> = state.getIn(['vis', 'present', 'datasets']);

  let fieldsOfGroup = [];
  if (marksOfGroup.length && marksOfGroup[0].from && marksOfGroup[0].from.data) {
    const dsId = String(marksOfGroup[0].from.data);
    const dataset: DatasetRecord =  datasets.get(dsId);
    const schema = dataset.get('_schema');
    const fields = schema.keySeq().toArray();
    fieldsOfGroup = fields;
  }
  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  const {
    selectionPreviewsPoint,
    selectionPreviewsInterval,
    applicationPreviewsPoint,
    applicationPreviewsInterval,
  } = generatePreviews(groupId, scaleInfo, fieldsOfGroup, groups, marksOfGroups, datasets, interaction);

  return {
    interaction,
    groups,
    scaleInfo,
    group,
    groupName,
    datasets,
    marksOfGroups,
    fieldsOfGroup,
    canDemonstrate,
    selectionPreviewsPoint,
    selectionPreviewsInterval,
    applicationPreviewsPoint,
    applicationPreviewsInterval
  };
}

function generatePreviews(groupId, scaleInfo, fieldsOfGroup, groups, marksOfGroups, datasets, interaction): {
  selectionPreviewsInterval: SelectionRecord[],
  selectionPreviewsPoint: SelectionRecord[],
  applicationPreviewsInterval: ApplicationRecord[],
  applicationPreviewsPoint: ApplicationRecord[]
} {
  const marksOfGroup = marksOfGroups.get(groupId);

  return {
    selectionPreviewsPoint: generateSelectionPreviews(marksOfGroup, scaleInfo, fieldsOfGroup, interaction, false),
    selectionPreviewsInterval: generateSelectionPreviews(marksOfGroup, scaleInfo, fieldsOfGroup, interaction, true),
    applicationPreviewsPoint: generateApplicationPreviews(groupId, marksOfGroup, scaleInfo, groups, marksOfGroups, datasets, false),
    applicationPreviewsInterval: generateApplicationPreviews(groupId, marksOfGroup, scaleInfo, groups, marksOfGroups, datasets, true)
  };
};

function generateSelectionPreviews(marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo, fieldsOfGroup: string[], interaction: InteractionRecord, isDemonstratingInterval: boolean): SelectionRecord[] {
  if (isDemonstratingInterval) {
    const defs: IntervalSelectionRecord[] = [];
    const brush = IntervalSelection({
      id: "brush",
      label: "Brush",
      field: 'xy'
    });
    const brush_y = IntervalSelection({
      id: "brush_y",
      label: "Brush (y-axis)",
      field: 'y'
    });
    const brush_x = IntervalSelection({
      id: "brush_x",
      label: "Brush (x-axis)",
      field: 'x'
    });

    // HEURISTICS: surface different interval selections depending on mark type
    const markTypes: Set<LyraMarkType> = new Set(marksOfGroup.map((mark) => mark.type));
    if (markTypes.has('symbol')) {
      if (scaleInfo.xScaleType && scaleInfo.yScaleType) defs.push(brush);
      if (scaleInfo.yScaleType) defs.push(brush_y);
      if (scaleInfo.xScaleType) defs.push(brush_x);
    }
    if (markTypes.has('rect')) {
      if (scaleInfo.xScaleType === ScaleSimpleType.DISCRETE) {
        defs.push(brush_x);
      }
      if (scaleInfo.yScaleType === ScaleSimpleType.DISCRETE) {
        defs.push(brush_y);
      }
    }
    if (markTypes.has('area')) {
      const areaMark = marksOfGroup.find(mark => mark.type === 'area').toJS();
      if (areaMark.encode && areaMark.encode.update && areaMark.encode.update.orient && areaMark.encode.update.orient.value) {
        // TODO(jzong) what if orient is not in update but is in one of the other ones?
        if (areaMark.encode.update.orient.value === 'vertical' && scaleInfo.xScaleType) {
          defs.push(brush_x);
        }
        else if (areaMark.encode.update.orient.value === 'horizontal' && scaleInfo.yScaleType) {
          defs.push(brush_y);
        }
      }
    }
    if (markTypes.has('line')) {
      // TODO(jzong) ?
    }
    return [... new Set(defs)];
  }
  else {
    const defs: PointSelectionRecord[] = [
      PointSelection({
        ptype: 'single',
        id: 'single',
        label: 'Single point',
        field: '_vgsid_'
      }),
      PointSelection({
        ptype: 'multi',
        id: 'multi',
        label: 'Multi point',
        field: '_vgsid_'
      }),
      PointSelection({
        ptype: 'single',
        id: 'single_project',
        label: 'Single point (by field)',
        field: interaction && interaction.selection && interaction.selection.field && interaction.selection.field !== '_vgsid_' ? interaction.selection.field : fieldsOfGroup[0]
      }),
      PointSelection({
        ptype: 'multi',
        id: 'multi_project',
        label: 'Multi point (by field)',
        field: interaction && interaction.selection && interaction.selection.field && interaction.selection.field !== '_vgsid_' ? interaction.selection.field : fieldsOfGroup[0]
      })
    ];
    return defs;
  }
}

function generateApplicationPreviews(groupId: number, marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo, groups: Map<number, GroupRecord>, marksOfGroups: Map<number, MarkRecord[]>, datasets: Map<string, DatasetRecord>, isDemonstratingInterval: boolean): ApplicationRecord[] {
  const defs: ApplicationRecord[] = [];

  // TODO(jzong): could add a heuristic -- better way to sort these?
  // TODO(jzong): change mark to dropdown
  marksOfGroup.forEach(mark => {
    defs.push(MarkApplication({
      id: "color_" + isDemonstratingInterval,
      label: "Color",
      targetMarkName: exportName(mark.name),
      isDemonstratingInterval: isDemonstratingInterval,
      propertyName: "fill",
      defaultValue: "#797979"
    }));
    defs.push(MarkApplication({
      id: "opacity_" + isDemonstratingInterval,
      label: "Opacity",
      targetMarkName: exportName(mark.name),
      isDemonstratingInterval: isDemonstratingInterval,
      propertyName: "opacity",
      defaultValue: "0.2"
    }));
    if (mark.type === 'symbol') {
      defs.push(MarkApplication({
        id: "size_" + isDemonstratingInterval,
        label: "Size",
        targetMarkName: exportName(mark.name),
        isDemonstratingInterval: isDemonstratingInterval,
        propertyName: "size",
        defaultValue: 30
      }));
    }
  });

  if (isDemonstratingInterval) {
    defs.push(ScaleApplication({
      id: "panzoom",
      label: "Pan and zoom",
      scaleInfo
    }));
  }

  const otherGroups = groups.filter(group => group._id !== groupId);
  otherGroups.forEach(otherGroup => {
    const otherGroupId = otherGroup._id;
    const marksOfOtherGroup = marksOfGroups.get(otherGroupId);
    const mark = marksOfOtherGroup.find(mark => mark.from && mark.from.data);
    if (mark) {
      const targetGroupName = exportName(otherGroup.name);
      const targetMarkName = exportName(mark.name);

      const datasetName = datasets.get(String(mark.from.data)).name;

      defs.push(TransformApplication({
        id: "filter_" + targetGroupName + "_" + isDemonstratingInterval,
        label: "Filter " + otherGroup.name,
        targetGroupName,
        datasetName,
        targetMarkName,
        isDemonstratingInterval: isDemonstratingInterval
      }));
    }
  });

  return defs;
}


function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    setSelection: (def: SelectionRecord, id: number) => {
      dispatch(setSelection(def, id));
    },
    setApplication: (def: ApplicationRecord, id: number) => {
      dispatch(setApplication(def, id));
    }
  };
}

class BaseInteractionInspector extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      isDemonstratingInterval: false,
      mainViewSignalValues: {}
    };
  }

  public componentDidMount() {
    console.log('mounted inspector');
    this.onSignal(this.props.groupName, 'grid_translate_anchor', (name, value) => this.onMainViewGridSignal(name, value));
    this.onSignal(this.props.groupName, 'grid_translate_delta', (name, value) => this.onMainViewGridSignal(name, value));
    this.onSignal(this.props.groupName, 'brush_x', (name, value) => this.onMainViewIntervalSignal(name, value));
    this.onSignal(this.props.groupName, 'brush_y', (name, value) => this.onMainViewIntervalSignal(name, value));
    this.onSignal(this.props.groupName, 'points_tuple', (name, value) => this.onMainViewPointSignal(name, value));
    this.onSignal(this.props.groupName, 'points_toggle', (name, value) => this.onMainViewPointSignal(name, value));
  }

  private getSelectionPreviews() {
    if (this.state.isDemonstratingInterval) {
      return this.props.selectionPreviewsInterval;
    }
    else {
      return this.props.selectionPreviewsPoint;
    }
  }

  private getApplicationPreviews() {
    if (this.state.isDemonstratingInterval) {
      return this.props.applicationPreviewsInterval;
    }
    else {
      return this.props.applicationPreviewsPoint;
    }
  }

  private previewRefs = {}; // id -> ref
  private mainViewSignalValues = {}; // name -> value

  private updatePreviewSignals(name, value) {
    this.getSelectionPreviews().forEach(preview => {
      if (this.previewRefs[preview.id] && this.previewRefs[preview.id].current) {
        this.previewRefs[preview.id].current.setPreviewSignal(name, value);
      }
    });
    this.getApplicationPreviews().forEach(preview => {
      if (this.previewRefs[preview.id] && this.previewRefs[preview.id].current) {
        this.previewRefs[preview.id].current.setPreviewSignal(name, value);
      }
    });
  }
  private updateIsDemonstrating() {
    const intervalActive = (this.mainViewSignalValues['brush_x'] &&
      this.mainViewSignalValues['brush_y'] &&
      this.mainViewSignalValues['brush_x'][0] !== this.mainViewSignalValues['brush_x'][1] &&
      this.mainViewSignalValues['brush_y'][0] !== this.mainViewSignalValues['brush_y'][1]);
    const pointActive = Boolean(this.mainViewSignalValues['points_tuple']);

    const isDemonstratingInterval = intervalActive || !pointActive;

    if (this.state.isDemonstratingInterval !== isDemonstratingInterval) {
      this.setState({
        isDemonstratingInterval
      });
    }
  }

  private onMainViewPointSignal(name, value) {
    if (this.mainViewSignalValues[name] !== value) {
      this.mainViewSignalValues[name] = value;
      this.updateIsDemonstrating();
      this.updatePreviewSignals(name, value);
    }
  }

  private onMainViewIntervalSignal(name, value) {
    if (this.mainViewSignalValues[name] !== value) {
      this.mainViewSignalValues[name] = value;
      this.updateIsDemonstrating();
      this.updatePreviewSignals(name, value);
    }
  }

  private onMainViewGridSignal(name, value) {
    this.mainViewSignalValues[name] = value;
    this.updatePreviewSignals(name, value);
  }

  private onSignal(groupName, signalName, handler) {
    listeners.onSignalInGroup(ctrl.view, groupName, signalName, handler);
  }

  private onClickInteractionPreview(preview: SelectionRecord | ApplicationRecord) {
    console.log('click preview', this.props.groupName);
    switch (preview.type) {
      case 'point':
      case 'interval':
        if (this.props.interaction) {
          this.props.setSelection(preview as SelectionRecord, this.props.interaction.id);
        }
        break;
      case 'mark':
      case 'scale':
      case 'transform':
        if (this.props.interaction) {
          this.props.setApplication(preview as ApplicationRecord, this.props.interaction.id);
        }
        break;
    }
  }

  private getFieldOptions(preview: PointSelectionRecord) {
    // TODO(jzong): add heuristic here by sorting the fields by frequency
    const options = this.props.fieldsOfGroup.map(field => <option key={field} value={field}>{field}</option>);

    return <div>
      <select value={preview.field} onChange={e => this.onSelectProjectionField(preview, e.target.value)}>
        {options}
      </select>
    </div>
  }

  private onSelectProjectionField(preview: PointSelectionRecord, field: string) {
    const newPreview = preview.set('field', field);
    // this.setState({
    //   selectionPreviews: this.state.selectionPreviews.map(p => {
    //     if (p === preview) {
    //       return newPreview;
    //     }
    //     return p;
    //   })
    // }, () => {
    //   this.props.setSelection(newPreview, this.props.interaction.id);
    // });
    this.props.setSelection(newPreview, this.props.interaction.id);
    // TODO (jzong) figure this out
  }

  private getSignalBubbles(scaleInfo, isDemonstratingInterval) {
    const signals = [];

    const handleDragStart = (evt) => {
      console.log(evt.target.dataset.signal);
      evt.dataTransfer.setData('signalName', evt.target.dataset.signal);
    }

    if (isDemonstratingInterval) {
      if (scaleInfo.xScaleName) {
        signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal={`brush_${scaleInfo.xScaleName}`}>{`brush_${scaleInfo.xScaleName}`}</div>)
      }
      if (scaleInfo.yScaleName) {
        signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal={`brush_${scaleInfo.yScaleName}`}>{`brush_${scaleInfo.yScaleName}`}</div>)
      }
      if (scaleInfo.xFieldName) {
        signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal={`brush_${scaleInfo.xFieldName}`}>{`brush_${scaleInfo.xFieldName}`}</div>)
      }
      if (scaleInfo.yFieldName) {
        signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal={`brush_${scaleInfo.yFieldName}`}>{`brush_${scaleInfo.yFieldName}`}</div>)
      }
    }
    else {
      signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal="points_tuple">points</div>)
    }
    return signals;
  }

  public render() {
    console.log('render interaction inspector');
    const interaction = this.props.interaction;
    const application = interaction.application;

    return (
      <div>


        <div className={"preview-controller"}>
          <div className='property-group'>
            <h3>Selections</h3>
            <div className="preview-scroll">
              {
                this.getSelectionPreviews().map((preview) => {
                  if (!this.previewRefs[preview.id]) {
                    this.previewRefs[preview.id] = React.createRef();
                  }
                  return (
                    <div key={preview.id} className={interaction && interaction.selection && interaction.selection.id === preview.id ? 'selected' : ''}
                        onClick={() => this.onClickInteractionPreview(preview)}>
                      <div className="preview-label">{preview.label}
                        {
                          preview.id.includes('project') ? this.getFieldOptions(preview as PointSelectionRecord) : ''
                        }
                      </div>
                      <InteractionPreview ref={this.previewRefs[preview.id]}
                        id={`preview-${preview.id}`}
                        groupName={this.props.groupName}
                        preview={preview}/>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className='property-group'>
            <h3>Applications</h3>
            <div className="preview-scroll">
              {
                this.getApplicationPreviews().map((preview) => {
                  if (!this.previewRefs[preview.id]) {
                    this.previewRefs[preview.id] = React.createRef();
                  }
                  return (
                    <div key={preview.id} className={interaction && interaction.application && interaction.application.id === preview.id ? 'selected' : ''}
                        onClick={() => this.onClickInteractionPreview(preview)}>
                      <div className="preview-label">{preview.label}</div>
                      <InteractionPreview ref={this.previewRefs[preview.id]}
                        id={`preview-${preview.id}`}
                        groupName={this.props.groupName}
                        preview={preview}/>
                    </div>
                  )
                })
              }
            </div>
          </div>
        </div>
        <div className="property-group">
          <h3>Signals</h3>
          <div className='signals-container'>
            {this.getSignalBubbles(this.props.scaleInfo, this.state.isDemonstratingInterval)}
          </div>
        </div>


        {
          application && application.type === 'mark' ? <InteractionMarkApplicationProperty interactionId={interaction.id} groupId={interaction.groupId} markApplication={application as MarkApplicationRecord}></InteractionMarkApplicationProperty> : null
        }
      </div>
    );
  }
};

export const InteractionInspector = connect(mapStateToProps, mapDispatchToProps)(BaseInteractionInspector);
