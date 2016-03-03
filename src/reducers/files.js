import { FS_INIT } from '../actions/base';

export function files(state = {}, action) {
  switch (action.type) {
    case FS_INIT:
      return Object.assign({}, action.payload);
    default:
      return state;
  }
}
