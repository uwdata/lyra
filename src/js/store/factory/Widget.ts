import {Map, Record, RecordOf} from 'immutable';
import {ColumnRecord} from './Dataset';
import {MarkApplicationRecord, InteractionSignal} from './Interaction';

type LyraWidgetType = 'radio' | 'range' | 'select';

interface LyraWidgetSelection {
  type: LyraWidgetType;
  id: string;
  label: string;
  step?: number;
  comparator: WidgetComparator;
}

export type WidgetComparator = '==' | '<' | '>' | '<=' | '>=';
export type WidgetSelectionRecord = RecordOf<LyraWidgetSelection>;
export const WidgetSelection = Record<LyraWidgetSelection>({
  type: null,
  id: null,
  label: null,
  step: null,
  comparator: null,
}, 'LyraWidgetSelection');

export interface LyraWidget {
  id: number;
  name: string;
  groupId: number;
  field: ColumnRecord;
  dsId: number;
  selection: WidgetSelectionRecord;
  applications: MarkApplicationRecord[];
  signals: InteractionSignal[];
};


export const Widget = Record<LyraWidget>({
  id: null,
  name: null,
  groupId: null,
  field: null,
  dsId: null,
  selection: null,
  applications: [],
  signals: []
}, 'LyraWidget');

export type WidgetRecord = RecordOf<LyraWidget>;
export type WidgetState = Map<string, WidgetRecord>;
