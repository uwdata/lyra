import * as React from 'react';
import {View, parse, Spec} from 'vega';
import {ApplicationRecord, SelectionRecord, TransformApplicationRecord} from '../../store/factory/Interaction';
import {addSelectionToScene, addApplicationToScene, cleanSpecForPreview} from '../../ctrl/demonstrations';

const listeners = require('../../ctrl/listeners');
const ctrl = require('../../ctrl');

interface OwnProps {
  id: string,
  groupName: string, // name of group mark (view) this preview is attached to,
  preview: SelectionRecord | ApplicationRecord,
  initialSignals: any, // this.mainViewSignalValues from InteractionPreviewController
  onClick: () => void
}
interface OwnState {
}

export class InteractionPreview extends React.Component<OwnProps, OwnState> {

  constructor(props) {
    super(props);
  }

  private width = 60; // these should match baseSignals in demonstrations.ts
  private height = 60; //

  private previewToSpec(preview: SelectionRecord | ApplicationRecord): Spec {
    // const spec = ctrl.export(false, true);
    const groupName = (preview as TransformApplicationRecord).targetGroupName || this.props.groupName;
    const spec = cleanSpecForPreview(ctrl.export(false, true), groupName);

    switch (preview.type) {
      case 'point':
      case 'interval':
        return addSelectionToScene(spec, this.props.groupName, preview as SelectionRecord);
      case 'mark':
      case 'scale':
      case 'transform':
        return addApplicationToScene(spec, this.props.groupName, preview as ApplicationRecord);
    }
    // console.warn('expected switch to be exhaustive');
    return spec;
  }

  private view;

  public componentDidMount() {
    const spec = this.previewToSpec(this.props.preview);

    // console.log(this.props.id, spec);

    this.view = new View(parse(spec), {
      renderer:  'svg',  // renderer (canvas or svg)
      container: `#${this.props.groupName}-${this.props.id}`   // parent DOM container
    });
    this.view.width(this.width);
    this.view.height(this.height);
    this.view.runAsync();

    this.setInitialSignals();
  };

  private setInitialSignals() {
    for (let [name, value] of Object.entries(this.props.initialSignals)) {
      this.setPreviewSignal(name, value);
    }
  }

  private scaleSignalValues(name, value) {
    const wScale = this.width/640; // preview width / main view width
    const hScale = this.height/360; // preview height / main view height

    if (name === 'brush_x') {
      return value.map(n => {
        return n * wScale;
      });
    }
    if (name === 'brush_y') {
      return value.map(n => {
        return n * hScale;
      });
    }
    if (name === 'grid_translate_delta') {
      return value ? {
        x: value.x * wScale,
        y: value.y * hScale
      } : value;
    }

    return value;
  }

  public setPreviewSignal(name, value) {
    if (this.view) {
      const scaledValue = this.scaleSignalValues(name, value);
      listeners.setSignalInGroup(this.view, this.props.groupName, name, scaledValue);
      this.view.runAsync();
    }
  }

  public getPreviewSignal(name) {
    if (this.view) {
      return listeners.getSignalInGroup(this.view, this.props.groupName, name);
    }
  }

  public render() {

    return (
      <div id={`${this.props.groupName}-${this.props.id}`} className={"interaction-preview"} onClick={this.props.onClick}></div>
    );
  }

}

export default InteractionPreview;
