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
  logger: 'http://localhost:8800' //window.TUTORIAL_LOG_ENDPOINT
}));

if (window.$) {
  window.$('.js-terminal').each(
    (_, el) => {
      render((
        <Provider store={store}>
          <Term/>
        </Provider>
      ), el);
    }
  );
} else {
  render((
    <Provider store={store}>
      <Term/>
    </Provider>
  ), document.getElementById('root'));
}
