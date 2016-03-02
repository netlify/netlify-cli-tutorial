import React from 'react';
import { render } from 'react-dom';
import Term from './components/term';
import 'file?name=index.html!../public/index.html';
import './stylesheets/main.css';

render((
  <Term/>
), document.getElementById('root'));
