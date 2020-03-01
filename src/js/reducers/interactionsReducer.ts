import {Map} from 'immutable';
import {ActionType, getType} from 'typesafe-actions';
import * as interactionActions from '../actions/interactionActions';
import {InteractionState} from '../store/factory/Interaction';

export function interactionsReducer(state: InteractionState, action: ActionType<typeof interactionActions>): InteractionState {
  const id = action.meta;

  if (typeof state === 'undefined') {
    return Map();
  }

  if (action.type === getType(interactionActions.addInteraction)) {
    return state.set(String(id), action.payload);
  }

  if (action.type === getType(interactionActions.setSelection)) {
    const t = action.payload;
    console.log(id, t);
    return state.setIn([String(id), 'selection'], t);
  }

  if (action.type === getType(interactionActions.setApplication)) {
    const t = action.payload;
    console.log(id, t);
    return state.setIn([String(id), 'application'], t);
  }

  if (action.type === getType(interactionActions.deleteInteraction)) {
    return state.remove(String(id));
  }

  return state;
}
