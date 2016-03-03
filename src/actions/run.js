import { addHistory, prompt } from './base';
import { ls } from './ls';
import { cd } from './cd';
import { cat } from './cat';
import { help } from './help';

export function unkownCommand(cmd) {
  return addHistory(`-bash: ${cmd}: command not found`);
}

export function run(cmd) {
  return (dispatch) => {
    dispatch(addHistory(prompt + cmd));
    const words = cmd.split(' ').filter((w) => w);
    switch (words[0]) {
      case 'ls':
        return dispatch(ls(words.slice(1)));
      case 'cd':
        return dispatch(cd(words.slice(1)));
      case 'cat':
        return dispatch(cat(words.slice(1)));
      case 'help':
        return dispatch(help());
      default:
        dispatch(unkownCommand(words[0]));
    }
  };
}
