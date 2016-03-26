import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { cmd } from '../reducers/cmd';
import { cmds } from '../reducers/cmds';
import { cwd } from '../reducers/cwd';
import { files } from '../reducers/files';
import { history } from '../reducers/history';
import { help } from '../reducers/help';
import { npm } from '../reducers/npm';
import { prompt } from '../reducers/prompt';

const reducer = combineReducers({
  cmd,
  cmds,
  cwd,
  files,
  history,
  help,
  npm,
  prompt
});

const createStoreWithMiddleware = compose(
  applyMiddleware(thunkMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)(createStore);

export default (initialState) => (
  createStoreWithMiddleware(reducer, initialState)
);
