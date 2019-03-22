import {Record, RecordOf} from 'immutable';
import {RectMark} from 'vega-typings';
import {GroupRecord} from './Group';
import {HandleStreams} from '../Mark';

const anchorTarget = require('../../../util/anchor-target');
const test = require('../../../util/test-if');
const propSg = require('../../../util/prop-signal');

export type LyraRectMark = {
  _id: number;
  _parent: number;
} & RectMark;

export const Rect = Record<LyraRectMark>({
  _id: null,
  _parent: null,
  type: 'rect',
  encode: {
    update: {
      x2: {value: 140},
      y2: {value: 140},
      xc: {value: 70, _disabled: true},
      yc: {value: 70, _disabled: true},
      width: {value: 40, _disabled: true},
      height: {value: 40, _disabled: true}
    }
  }
});

export type RectRecord = RecordOf<LyraRectMark>;

/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} rect - A rect properties object or instantiated Rect mark
 * @param {number} rect._id - A numeric mark ID
 * @param {string} rect.type - A mark type, presumably "rect"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
export function getHandleStreams(rect: RectRecord | GroupRecord): HandleStreams {
  const sg = require('../../../ctrl/signals');
  const at = anchorTarget.bind(null, rect, 'handles');
  const id = rect._id;
  const type = rect.type;
  const x = propSg(id, type, 'x');
  const xc = propSg(id, type, 'xc');
  const x2 = propSg(id, type, 'x2');
  const y = propSg(id, type, 'y');
  const yc = propSg(id, type, 'yc');
  const y2 = propSg(id, type, 'y2');
  const w = propSg(id, type, 'width');
  const h = propSg(id, type, 'height');
  const DELTA = sg.DELTA;
  const DX = DELTA + '.x';
  const DY = DELTA + '.y';
  const streams: HandleStreams = {};

  streams[x] = [{
    events: DELTA, update: test(at() + '||' + at('left'), x + '+' + DX, x)
  }];
  streams[xc] = [{
    events: DELTA, update: test(at() + '||' + at('left'), xc + '+' + DX, xc)
  }];
  streams[x2] = [{
    events: DELTA, update: test(at() + '||' + at('right'), x2 + '+' + DX, x2)
  }];
  streams[y] = [{
    events: DELTA, update: test(at() + '||' + at('top'), y + '+' + DY, y)
  }];
  streams[yc] = [{
    events: DELTA, update: test(at() + '||' + at('top'), yc + '+' + DY, yc)
  }];
  streams[y2] = [{
    events: DELTA, update: test(at() + '||' + at('bottom'), y2 + '+' + DY, y2)
  }];
  streams[w] = [
    {events: DELTA, update: test(at('left'), w + '-' + DX, w)},
    {events: DELTA, update: test(at('right'), w + '+' + DX, w)}
  ];
  streams[h] = [
    {events: DELTA, update: test(at('top'), h + '-' + DY, h)},
    {events: DELTA, update: test(at('bottom'), h + '+' + DY, h)}
  ];

  return streams;
};
