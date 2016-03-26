
function runNext(dispatch, actions) {
  var head = actions[0];
  var tail = actions.slice(1);
  dispatch(head.action);
  if (tail.length) {
    setTimeout((() => runNext(dispatch, tail)), (tail[0].TS - head.TS) * 1000);
  }
}

export function playback(session) {
  return (dispatch, getState) => {
    const { config } = getState();
    if (!config.logger) { return; }

    fetch(config.logger + '/' + session)
      .then((response) => response.json())
      .then((json) => {
        const actions = json.map((action) => {
          console.log('action: %o', action);
          const data = JSON.parse(action.Data);
          return {TS: action.TS, order: data.order, action: data.action};
        }).sort((a, b) => a.order - b.order);
        runNext(dispatch, actions);
      });
  };
}
