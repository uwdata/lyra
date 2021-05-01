import {ActionTypes as historyActions} from 'redux-undo';
import {ActionType, getType} from 'typesafe-actions';
import * as helperActions from '../actions/bindChannel/helperActions';
import * as datasetActions from '../actions/datasetActions';
import * as guideActions from '../actions/guideActions';
import * as interactionActions from '../actions/interactionActions';
import * as widgetActions from '../actions/widgetActions';
import * as markActions from '../actions/markActions';
import * as pipelineActions from '../actions/pipelineActions';
import * as scaleActions from '../actions/scaleActions';
import * as sceneActions from '../actions/sceneActions';
import * as signalActions from '../actions/signalActions';
import * as vegaActions from '../actions/vegaActions';
import {hydrate} from '../ctrl/persist';
import {VegaReparse, VegaReparseRecord} from '../store/factory/Vega';

/**
 * This reducer handles whether to recreate the view from the lyra ctrl.
 * @param {boolean} state - The existing ctrl reparse value from the store
 * @param {Object} action - The dispatched action indicating how to modify
 * the reparse flag within the store.
 * @returns {boolean} The new state of the reparse flag
 */
export function invalidateVegaReducer(state: VegaReparseRecord,
                              action: ActionType<typeof vegaActions | typeof datasetActions | typeof hydrate |
                              typeof markActions | typeof pipelineActions | typeof sceneActions | typeof historyActions |
                              typeof scaleActions | typeof helperActions | typeof signalActions | typeof guideActions |
                              typeof interactionActions | typeof widgetActions>): VegaReparseRecord {
  if (typeof state === 'undefined') {
    return VegaReparse({
      invalid: false,
      isParsing: false
    });
  }

  if (action.type === getType(vegaActions.invalidateVega)) {
    return state.set('invalid', action.payload);
  }

  switch (action.type) {
    // All of these actions implicitly invalidate the view
    case getType(sceneActions.baseCreateScene):
    case getType(pipelineActions.baseAddPipeline):
    case getType(signalActions.initSignal):
    case getType(markActions.baseAddMark):
    case getType(guideActions.deleteGuide):
    case getType(markActions.baseDeleteMark):
    case getType(markActions.setParent):
    case getType(markActions.updateMarkProperty):
    case getType(markActions.setMarkVisual):
    case getType(markActions.disableMarkVisual):
    case getType(markActions.resetMarkVisual):
    case getType(markActions.setMarkExtent):
    case getType(markActions.bindScale):
    case getType(scaleActions.baseAddScale):
    case getType(scaleActions.updateScaleProperty):
    case getType(helperActions.addScaleToGroup):
    case getType(scaleActions.deleteScale):
    case getType(guideActions.baseAddGuide):
    case getType(guideActions.updateGuideProperty):
    case getType(helperActions.addAxisToGroup):
    case getType(helperActions.addLegendToGroup):
    case getType(interactionActions.baseAddInteraction):
    case getType(interactionActions.setInput):
    case getType(interactionActions.setSelection):
    case getType(interactionActions.setApplication):
    case getType(interactionActions.setSignalPush):
    case getType(interactionActions.removeApplication):
    case getType(interactionActions.deleteInteraction):
    case getType(widgetActions.baseAddWidget):
    case getType(widgetActions.setSelection):
    case getType(widgetActions.setApplication):
    case getType(widgetActions.removeApplication):
    case getType(widgetActions.deleteWidget):
    // ACTIONS.REMOVE_AXIS_FROM_GROUP, // TODO this action doesn't exist (but would belong in helperActions
    case getType(datasetActions.sortDataset):
    case getType(datasetActions.addTransform):
    case getType(datasetActions.updateTransform):
    case getType(hydrate):
    case historyActions.UNDO:
    case historyActions.REDO:
    case historyActions.JUMP:
      return state.set('invalid', true);
  }

  if (action.type === getType(vegaActions.parseVega)) {
    return state.merge({
      isParsing: action.payload,
      // Toggle this back to false now that the parse is in progress (or done)
      invalid: false
    });
  }

  return state;
}
