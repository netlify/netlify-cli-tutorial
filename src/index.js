import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Term from './components/term';
import configureStore from './store/configure';
import { setConfig } from './actions/config';
import 'file?name=index.html!../public/index.html';
import './stylesheets/main.css';

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

const store = configureStore();

store.dispatch(setConfig({
  session: guid(),
  logger: window.TUTORIAL_LOG_ENDPOINT
}));

function termProvider(maxHeight, autoFocus) {
  const setAutoFocus = autoFocus && autoFocus !== "false";

  return <Provider store={store}>
    <Term maxHeight={maxHeight} autoFocus={setAutoFocus}/>
  </Provider>;
}

if (window.$) {
  window.$('.js-terminal').each(
    (_, el) => {
      render(termProvider(window.$(el).data('max-height') || 600, window.$(el).data('auto-focus') || true), el);
    }
  );
} else {
  render(termProvider(600, true), document.getElementById('root'));
}
