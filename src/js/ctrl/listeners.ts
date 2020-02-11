import * as d3 from 'd3';
import {redo, undo} from '../actions/historyActions';
import {selectMark, expandLayers, baseSelectMark} from '../actions/inspectorActions';
import {deleteMark} from '../actions/markActions';
import {store} from '../store';
import {MODE, SELECTED} from '../store/factory/Signal';
import sg from './signals';
import {getParentGroupIds} from '../util/hierarchy';

const ACTIONS = require('../actions/Names');
const ctrl = require('./');

// jzong: converting this module to import instead of require leads to pain and wasted time
module.exports = {
  onSignal,
  offSignal,
  onSignalInGroup,
  offSignalInGroup,
  setSignalInGroup,
  getSignalInGroup,
  register: registerSignalListeners
};

const listeners = {};
const groupListeners: {
  [groupName: string]: {
    [signalName: string]: {
      operator: {_targets?: any, value?: any},
      handler: (name, value) => void
    }[]
  }
} = {};

d3.select(window)
  .on('keydown', function() {
    const evt = d3.event;
    handleHistory(evt);
    handleDelete(evt);
  })
  .on('beforeunload', beforeUnload);

/**
 * Registers a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to call when the value of the
 * named signal changes.
 * @returns {Object} The Lyra ctrl.
 */
export function onSignal(name, handler) {
  listeners[name] = listeners[name] || [];
  listeners[name].push(handler);
  if (ctrl.view) {
    ctrl.view.addSignalListener(name, handler);
  }
  return ctrl;
}

/**
 * Unregisters a signal value change handler.
 * @param  {string} name - The name of a signal.
 * @param  {Function} handler - The function to unregister; this function
 * should have previously been registered for this signal using `onSignal`.
 * @returns {Object} The Lyra ctrl.
 */
export function offSignal(name, handler) {
  listeners[name] = listeners[name] || [];
  const listener = listeners[name];
  for (let i = listener.length; --i >= 0; ) {
    if (!handler || listener[i] === handler) {
      listener.splice(i, 1);
    }
  }
  if (ctrl.view) {
    ctrl.view.removeSignalListener(name, handler);
  }
  return ctrl;
}

/*
 * Finds a signal in a top-level group (a direct child of scene)
*/
function getSignalOperatorInGroup(view, groupName, signalName) {
  const rootItemNode = view._scenegraph.root.items[0];
  for (let markNode of rootItemNode.items) {
    if (markNode.name && markNode.marktype === 'group') {
      if (markNode.name === groupName) {
        if (markNode.items && markNode.items.length) {
          const itemNode = markNode.items[0];
          const signals = itemNode.context.signals;
          for (let name of Object.keys(signals)) {
            if (name === signalName) {
              return signals[name];
            }
          }
        }
      }
    }
  }
  return null;
}

export function onSignalInGroup(view, groupName, signalName, handler) {
  const operator = getSignalOperatorInGroup(view, groupName, signalName);
  if (operator) {
    const h: any = function() { handler(signalName, operator.value); };
        h.handler = handler;

    groupListeners[groupName] = groupListeners[groupName] || {};
    groupListeners[groupName][signalName] = groupListeners[groupName][signalName] || [];
    groupListeners[groupName][signalName].push({
      operator,
      handler: h
    });
    view.on(operator, null, h);
  }
}

export function offSignalInGroup(view, groupName, signalName, handler) {
  const operator = getSignalOperatorInGroup(view, groupName, signalName);
  if (operator) {
    groupListeners[groupName] = groupListeners[groupName] || {};
    groupListeners[groupName][signalName] = groupListeners[groupName][signalName] || [];
    const listener = groupListeners[groupName][signalName];
    for (let i = listener.length; --i >= 0; ) {
      if (!handler || listener[i].handler === handler) {
        listener[i].operator._targets.remove(handler);
        listener.splice(i, 1);
      }
    }
  }
}

export function setSignalInGroup(view, groupName, signalName, value) {
  const operator = getSignalOperatorInGroup(view, groupName, signalName);
  view.update(operator, value);
  view.runAsync();
}


export function getSignalInGroup(view, groupName, signalName) {
  const operator = getSignalOperatorInGroup(view, groupName, signalName);
  if (operator) {
    return operator.value;
  }
  return null;
}

/**
 * Registers default signal listeners to coordinate altChannel manipulators and
 * to ensure clicking a mark selects its within redux. Any cached listeners
 * (e.g., by property inspectors) are re-registered after re-parses.
 * @returns {void}
 */
export function registerSignalListeners() {
  const win = d3.select(window);
  const dragover = 'dragover.altchan';

  // Register a window dragover event handler to detect shiftKey
  // presses for alternate channel manipulators.
  if (!win.on(dragover)) {
    win.on(dragover, function() {
      const mode = sg.get(MODE);
      const shiftKey = d3.event.shiftKey;
      const channels = mode === 'channels';
      const altchannels = mode === 'altchannels';

      if (!channels && !altchannels) {
        return;
      }

      if (channels && shiftKey) {
        sg.set(MODE, 'altchannels');
        ctrl.update();
      } else if (altchannels && !shiftKey) {
        sg.set(MODE, 'channels');
        ctrl.update();
      }
    });
  }

  if (ctrl.view) {
    //  TODO (jzong): this works and is good, but currently conflicts with the
    //  way we're doing multi-interactions in InteractionPreviewController, fix that then uncomment this
    // ctrl.view.addSignalListener(SELECTED, function(name, selected) {
    //   const role = selected.mark.role;
    //   const id = role && +role.split('lyra_')[1];
    //   const state = store.getState();

    //   if (state.getIn(['inspector', 'encodings', 'selectedId']) === id) {
    //     return;
    //   }

    //   // Walk up from the selected primitive to create an array of its parent groups' IDs
    //   const parentLayerIds = getParentGroupIds(id, state);

    //   if (id) {
    //     // Select the mark,
    //     store.dispatch(baseSelectMark(id, parentLayerIds));
    //     // And expand the hierarchy so that it is visible
    //     store.dispatch(expandLayers(parentLayerIds));
    //   }
    // });

    Object.keys(listeners).forEach(function(signalName) {
      if (!ctrl.view._signals[signalName]) {
        listeners[signalName] = [];
      } else {
        listeners[signalName].forEach(function(handlerFn) {
          ctrl.view.addSignalListener(signalName, handlerFn);
        });
      }
    });

    Object.keys(groupListeners).forEach(function(groupName) {
      Object.keys(groupListeners[groupName]).forEach(function(signalName) {
        const maybeSignal = getSignalOperatorInGroup(ctrl.view, groupName, signalName);
        if (!maybeSignal) {
          groupListeners[groupName][signalName] = [];
        } else {
          groupListeners[groupName][signalName].forEach(function(def) {
            ctrl.view.on(def.operator, null, def.handler);
          });
        }
      });
    });
  }
}

/**
 * Returns true if the keypresses occured within an input/textarea/contenteditable,
 * in which case, we want the default functionality to kick in, not our custom.
 * @param   {Event}   evt The triggering DOM event.
 * @returns {boolean} True/false if default behaviour should/should not occur.
 */
function testInput(evt): boolean {
  const target = evt.srcElement || evt.target;
  const tagName = target.tagName.toUpperCase();

  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || target.contentEditable === 'true') {
    return !target.readOnly && !target.disabled;
  }

  return false;
}

/**
 * Handles keyboard shortcuts for undo/redo
 * @param   {Event}   evt The triggering DOM event.
 * @returns {boolean} False, to prevent default behaviours.
 */
function handleHistory(evt): boolean {
  const keyCode = evt.keyCode;

  if ((!testInput(evt) && evt.metaKey === true) || evt.ctrlKey === true) {
    // Command or Ctrl
    if (keyCode === 89) {
      // Y
      store.dispatch(redo());
      evt.preventDefault();
      return false;
    } else if (keyCode === 90) {
      // Z
      // special case (CMD-SHIFT-Z) does a redo on a mac
      store.dispatch(evt.shiftKey ? redo() : undo());
      evt.preventDefault();
      return false;
    }
  }
}

/**
 * Handles keyboard shortcut to delete the selected mark by pressing delete/backspace.
 * @param   {Event}   evt The triggering DOM event.
 * @returns {boolean} False, to prevent default behaviours.
 */
function handleDelete(evt): boolean {
  if (!testInput(evt) && evt.keyCode === 8) {
    // Delete/Backspace
    const state = store.getState();
    const inspectors = state.getIn(['inspector', 'encodings']);
    const type = inspectors.get('selectedType');
    const id = inspectors.get('selectedId');
    const groupId = state.getIn(['vis', 'present', 'marks', String(id), '_parent']);

    if (type === ACTIONS.SELECT_MARK) {
      evt.preventDefault();
      store.dispatch(selectMark(groupId) as any); // TODO(jzong) make sure it's dispatching these two thunk actions correctly
      store.dispatch(deleteMark(id) as any);
      return false;
    }
  }
}

/**
 * When built for production mode, throws a prompt to prevent unwanted
 * navigation away from Lyra.
 * @returns {string} Error message to prevent unwanted navigation away in Webkit.
 */
function beforeUnload(): string {
  if (process.env.NODE_ENV === 'production') {
    const msg = 'You have unsaved changed in Lyra.';
    d3.event.returnValue = msg; // Gecko + IE
    return msg; // Webkit, Safari, Chrome etc.
  }
}
