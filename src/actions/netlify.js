import { addHistory } from './base';
import { showHelp, helpSeen } from './help';

export function netlify(names) {
  return (dispatch, getState) => {
    const { help, npm } = getState();

    if (!npm.packages['netlify-cli']) {
      return dispatch(addHistory(
        '-bash: netlify: command not found',
        '',
        '(hint: make sure to run \'npm install netlify-cli -g\' first)'
      ));
    }

    if (names.length === 0 || names[1] === 'help') {
      dispatch(addHistory(
'',
'  Usage: netlify [options] [command]',
'',
'    The premium hosting service for modern static websites',
'',
'    Read more at https://www.netlify.com/docs/cli',
'',
'  Commands:',
'',
'    create [options]   Create a new site',
'    deploy [options]   Push a new deploy to netlify',
'    update [options]   Updates site attributes',
'    delete [options]   Delete site',
'    sites [options]    List your sites',
'    open [options]     Open site in the webui',
'    init               Configure continuous deployment',
'',
'  Options:',
'',
'    -h, --help                 output usage information',
'    -V, --version              output the version number',
'    -t --access-token <token>  Override the default Access Token',
'    -e --env <environment>     Specify an environment for the local configuration',
''));
      if (!help.netlify) {
        dispatch(showHelp());
      }
    }
  };
}
