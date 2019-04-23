import {Record, RecordOf} from 'immutable';
import {Omit} from 'react-redux';
import {GroupMark} from 'vega-typings/types';

export interface LyraSceneMark extends Omit<GroupMark, 'type'> {
  _id: number;
  _parent: number;
  type: 'group';
}
export const Scene = Record<LyraSceneMark>({
  type: 'group',
  _id: null,
  _parent: null,
  scales: [],
  axes: [],
  legends: [],
  marks: [],
  name: null,
  encode: {
    update: {
      fill: undefined,
      stroke: undefined,
      x: {value: 0},
      y: {value: 0},
      // TODO(jzong): _disabled is not part of vega-typings encode.d.ts
      // but somehow it works on group and rect so honestly idk
      // x2: {_disabled: true},
      // y2: {_disabled: true},
      // xc: {value: 70, _disabled: true},
      // yc: {value: 70, _disabled: true},
      width: {value: 500},
      height: {value: 500},
      padding: {value: 'auto'},
      background: {value: 'auto'},
    }
  },
});
export type SceneRecord = RecordOf<LyraSceneMark>;
