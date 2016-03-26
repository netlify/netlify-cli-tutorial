let order = 0;

export const logMiddleware = (store) => (next) => (action) => {
  const { config } = store.getState();
  if (config.logger && !config.playback) {
    fetch(config.logger + '/' + config.session, {
      method: 'POST',
      body: JSON.stringify({
        order: order++,
        action: action
      })
    });
  }
  return next(action);
};
