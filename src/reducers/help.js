export function help(state = {}, action) {
  switch (action.type) {
    case 'HELP_SEEN':
      var seen = {};
      seen[action.payload] = true;
      return Object.assign({}, state, seen);
    default:
      return state;
  }
}
