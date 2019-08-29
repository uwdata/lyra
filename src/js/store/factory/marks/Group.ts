import {Record, RecordOf} from 'immutable';
import {GroupMark} from 'vega-typings';
// import {store} from '../../';

const getInVis = require('../../../util/immutable-utils').getInVis;

export type LyraGroupMark = {
  _id: number;
  _parent: number;
  _manualLayout: boolean;
} & GroupMark;

export function Group(values?: Partial<LyraGroupMark>): GroupRecord {
  // TODO(jzong) this was a circular dependency
  // const state = store.getState();
  // const scene = getInVis(state, 'marks.' + getInVis(state, 'scene._id'));

  return Record<LyraGroupMark>({
    _id: null,
    _parent: null,
    _manualLayout: false,
    type: 'group',
    name: null,
    from: null,
    scales: [],
    axes: [],
    legends: [],
    marks: [],
    encode: {
      // To allow marks across layered groups to be selected interactively on
      // the campus, groups do not have a fill color by default. Users may, of
      // course set a fill color. If a group is explicitly selected from the
      // sidebar, a transparent fill is rendered in order for direct
      // manipulation events of the group itself to be captured.
      update: {
        fill: null, // use special null value to indicate that this field should not be overwritten by defaults
        stroke: null,
        x: {value: 0},
        y: {value: 0},
        x2: {value: 140, _disabled: true},
        y2: {value: 140, _disabled: true},
        xc: {value: 70, _disabled: true},
        yc: {value: 70, _disabled: true},
        // width: {value: scene && scene.get('width')},
        // height: {value: scene && scene.get('height')},
        width: {value: 640},
        height: {value: 360}
      }
    }
  })(values);
}

export type GroupRecord = RecordOf<LyraGroupMark>;
