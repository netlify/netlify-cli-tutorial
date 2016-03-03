import { HIST_ADD } from '../actions/base';

function toArray(obj) {
  return Array.isArray(obj) ? obj : [obj];
}

export function history(state = [], action) {

  switch (action.type) {
    case HIST_ADD:
      return state.concat(toArray(action.payload));
    default:
      return state;
  }
}
