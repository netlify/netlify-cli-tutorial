import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Term from './components/term';
import configureStore from './store/configure';
import 'file?name=index.html!../public/index.html';
import './stylesheets/main.css';

const store = configureStore();

render((
  <Provider store={store}>
    <Term/>
  </Provider>
), document.getElementById('root'));
