import {Record, RecordOf} from 'immutable';
import {LineMark, SignalRef} from 'vega-typings';
import {HandleStreams} from '../Mark';
import {signalNames} from '../Signal';
import {propSg} from '../../../util/prop-signal';

const anchorTarget = require('../../../util/anchor-target');
const test = require('../../../util/test-if');

export type LyraLineMark = {
  _id: number;
  _parent: number;
} & LineMark;

export const Line = Record<LyraLineMark>({
  _id: null,
  _parent: null,
  type: 'line',
  name: null,
  encode: {
    update: {
      fill: undefined,
      fillOpacity: undefined,
      strokeWidth: {value: 3},
      tension: {value: 13},
      interpolate: {value: 'monotone'}
    }
  }
});

export type LineRecord = RecordOf<LyraLineMark>;

/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} line - A line properties object or instantiated line mark
 * @param {number} line._id - A numeric mark ID
 * @param {string} line.type - A mark type, presumably "line"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
export function getHandleStreams(line: LineRecord): HandleStreams {
  const at = anchorTarget.bind(null, line, 'handles');
  const id = line._id;
  const x = propSg(id, 'line', 'x');
  const y = propSg(id, 'line', 'y');
  const DELTA: string = signalNames.DELTA;
  const DX = DELTA + '.x';
  const DY = DELTA + '.y';
  const streams: HandleStreams = {};

  streams[x] = [{
    events: {signal: DELTA}, update: test(at(), x + '+' + DX, x)
  }];
  streams[y] = [{
    events: {signal: DELTA}, update: test(at(), y + '+' + DY, y)
  }];
  return streams;
};
