const getInVis = require('../../util/immutable-utils').getInVis;

import {LyraAggregateTransform} from '../../store/factory/Pipeline';
import {summarizeAggregate} from '../datasetActions';
import {aggregatePipeline} from '../pipelineActions';
import {AnyAction, Dispatch} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {State} from '../../store';

/**
 * Parse the data source definitions in the resultant Vega specification.
 * For now, as we do not yet support transforms, we only add an entry to the
 * `map` to identify the data source named "source" as our backing Lyra
 * dataset.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param {number} dsId        The ID of the current mark's backing dataset.
 * @returns {void}
 */
export function parseData(dispatch: Dispatch, state: State, parsed) {
  // TODO: transforms.
  const data = parsed.output.data;
  const source = data.find(function(def) {
    return def.name === 'source';
  });
  const summary = data.find(function(def) {
    return def.name === 'summary';
  });

  parsed.map.data.source = parsed.dsId;

  if (summary) {
    parseAggregate(dispatch, state, parsed, summary);
  }
};

function parseAggregate(dispatch: ThunkDispatch<State, null, AnyAction>, state: State, parsed, summary) {
  const aggregate: LyraAggregateTransform = summary.transform.find(function(tx) {
    return tx.type === 'aggregate';
  });

  const groupby = aggregate.groupby as string[]; // TODO vega 2 groupby was string[]
  const keys  = groupby.join('|');
  const plId  = parsed.plId;
  let aggId = getInVis(state, 'pipelines.' + plId + '._aggregates.' + keys);

  if (!aggId) {
    // TODO: What about if a previous parsed.map.data.summary exists? How do
    // we derive a new agg DS to preserve transforms.
    dispatch(aggregatePipeline(plId, aggregate));
    aggId = aggregate._id;
  } else {
    dispatch(summarizeAggregate(aggregate, aggId));
  }

  parsed.map.data.summary = aggId;
}
