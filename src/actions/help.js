import { addHistory } from './base';

export function help() {
  return addHistory(
    'ls -- list directory contents',
    'cat -- concatenate and print files',
    'cd -- change directory',
    'help -- this help text'
  );
}
