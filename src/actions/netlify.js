import { addHistory, updateHistory } from './base';
import { showHelp } from './help';
import { setPrompt, clearPrompt, hidePrompt } from './prompt';

function configureSite(dispatch, state, answer) {
  dispatch(setPrompt('netlify', '? Path to deploy? (current dir) ', {setting: 'dir'}));
}

function configureDir(dispatch, state, folder) {
  dispatch(clearPrompt());
  dispatch(addHistory('Deploying folder ' + folder));
  const showDeploy = (uploaded) => {
    var progress = '[';
    for (var i = 0; i < 40; i++) {
      if (i <= 40 * uploaded / 5) {
        progress += '=';
      } else {
        progress += ' ';
      }
    }
    progress += '] Uploading';
    dispatch(updateHistory(progress));
    if (uploaded == 5) {
      dispatch(addHistory(
        'Awesome! You just deployed your first site to netlify',
        '',
        'Check it out at http://example.netlify.com/',
        ''
      ));
      dispatch(clearPrompt());
    } else {
      var time = Math.random() * 800 + 200;
      setTimeout((() => showDeploy(uploaded + 1)), time);
    }
  };
  dispatch(hidePrompt());
  dispatch(addHistory(
    '[                                        ] Uploading'
  ));
  showDeploy(0);
}

function deploy(dispatch, state) {
  const { cwd } = state;
  switch (cwd) {
    case 'static-site':
    case 'jekyll-site':
      return dispatch(setPrompt('netlify', '? No site id specified, create a new site (Y/n) ', {setting: 'site'}));
    default:
      dispatch(addHistory(
        'The real netlify CLI will let you push just about anything to our CDN',
        'However, for this demo - try one of the example sites.'
      ));
  }
}

export function netlify(names) {
  return (dispatch, getState) => {
    const { help, npm, prompt, cwd } = getState();

    if (prompt.handler && prompt.data.setting == 'site') {
      return configureSite(dispatch, getState(), names[0]);
    }
    if (prompt.handler && prompt.data.setting === 'dir') {
      return configureDir(dispatch, getState(), names[0] || cwd);
    }

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
    } else if (names[0] === 'deploy') {
      deploy(dispatch, getState());
    }
  };
}
