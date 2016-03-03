import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { cmds } from '../reducers/cmds';
import { cwd } from '../reducers/cwd';
import { files } from '../reducers/files';
import { history } from '../reducers/history';


const reducer = combineReducers({
  cmds,
  cwd,
  files,
  history
});

const createStoreWithMiddleware = compose(
  applyMiddleware(thunkMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : (f) => f
)(createStore);

export default (initialState) => (
  createStoreWithMiddleware(reducer, initialState)
);
