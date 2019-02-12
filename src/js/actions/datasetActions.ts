import {createStandardAction} from 'typesafe-actions';
import {AggregateTransform, Compare, Transform} from 'vega-typings/types';
import {DatasetRecord, MType} from '../store/factory/Dataset';

const counter = require('../util/counter');

export const addDataset = createStandardAction('ADD_DATASET').map((payload: DatasetRecord) => {
  const id: number = payload._id || counter.global();
  return {payload: payload.merge({_id: id}), meta: id}
});

export const deleteDataset = createStandardAction('DELETE_DATASET')<number, number>();

export const changeFieldMType = createStandardAction('CHANGE_FIELD_MTYPE')<{field: string, mtype: MType}, number>();

export const sortDataset = createStandardAction('SORT_DATASET')<Compare, number>();

export const summarizeAggregate = createStandardAction('SUMMARIZE_AGGREGATE')<AggregateTransform, number>();

export const addTransform = createStandardAction('ADD_DATA_TRANSFORM')<Transform, number>();

export const updateTransform = createStandardAction('UPDATE_DATA_TRANSFORM')<{index: number, transform: Transform}, number>();
