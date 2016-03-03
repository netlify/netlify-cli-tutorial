export const prompt = '$ ';

export const FS_INIT = 'FS_INIT';

export function initFilesystem(files) {
  return {
    type: FS_INIT,
    payload: files
  };
}

export const HIST_ADD = 'HIST_ADD';

export function addHistory(/* arguments */) {
  return {
    type: HIST_ADD,
    payload: Array.prototype.slice.call(arguments)
  };
}

export const CWD_SET = 'CWD_SET';

export function setCwd(cwd) {
  return {
    type: CWD_SET,
    payload: cwd
  };
}
