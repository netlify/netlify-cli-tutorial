import Rusha from 'rusha';
import Auth from '../lib/netlify-auth';
import API from '../lib/netlify-api';
import { lookup } from '../lib/filesystem';
import { addFile, addHistory, updateHistory } from './base';
import { showHelp } from './help';
import { setPrompt, clearPrompt, hidePrompt } from './prompt';

let credentials = null;

export function netlify(names) {
  return (dispatch, getState) => {
    const { help, npm, prompt } = getState();

    if (prompt.handler && prompt.data.setting == 'site') {
      return configureSite(dispatch, getState(), names[0]);
    }
    if (prompt.handler && prompt.data.setting === 'dir') {
      return configureDir(dispatch, getState(), names[0]);
    }

    if (!npm.packages['netlify-cli']) {
      return commandNotFound(dispatch);
    }

    if (names.length === 0 || names[1] === 'help') {
      outputHelp(dispatch);
      if (!help.seen.netlify) {
        dispatch(showHelp());
      }
      return;
    }

    if (names[1] === '--help' && helpTexts[names[0]]) {
      const text = helpTexts[names[0]].split('\n');
      return dispatch(addHistory(...text));
    }

    switch (names[0]) {
      case 'deploy':
        return deploy(dispatch, getState());
      case 'open':
        return openSite(dispatch, getState());
      default:
        return outputHelp(dispatch);
    }
  };
}

const helpTexts = {
  create: `
  Usage: create [options]

  Create a new site

  Options:

    -h, --help                   output usage information
    -n --name <name>             Set <name>.netlify.com
    -d --custom-domain [domain]  Set the custom domain for the site
    -p --password [password]     Set the password for the site
`,
  deploy: `
  Usage: deploy [options]

  Push a new deploy to netlify

  Options:

    -h, --help         output usage information
    -s --site-id [id]  Deploy to site with <id>
    -p --path [path]   Path to a folder or zip file to deploy
    -d --draft         Deploy as a draft without publishing
`,
  update: `
  Usage: update [options]

  Updates site attributes

  Options:

    -h, --help                   output usage information
    -s --site-id [id]            The site to update
    -n --name [name]             Set <name>.netlify.com
    -d --custom-domain [domain]  Set the custom domain for the site
    -p --password [password]     Set the password for the site
`,
  init: `
  Usage: init [options]

  Configure continuous deployment

  Options:

    -h, --help  output usage information
`,
  delete: `
  Usage: delete [options]

  Delete site

  Options:

    -h, --help         output usage information
    -s --site-id [id]  The id of the site to delete
    -y --yes           Don't prompt for confirmation
`,
  sites: `
  Usage: sites [options]

  List your sites

  Options:

    -h, --help  output usage information
    -g --guest  List sites you have access to as a collaborator
`,
  open: `
  Usage: open [options]

  Open site in the webui

  Options:

    -h, --help         output usage information
    -s --site-id [id]  The id of the site to open
`,
};

function commandNotFound(dispatch) {
  dispatch(addHistory(
    '-bash: netlify: command not found',
    '',
    '(hint: make sure to run \'npm install netlify-cli -g\' first)'
  ));
}

function outputHelp(dispatch) {
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
'    -e --env <environment>     Specify an environment',
''));
}

function openSite(dispatch, state) {
  window.open('https://example.netlify.com');
}

function configureSite(dispatch, state, answer) {
  dispatch(setPrompt('netlify', '? Path to deploy? (current dir) ', {setting: 'dir'}));
}

function configureDir(dispatch, state, folder) {
  const { cwd } = state;
  dispatch(clearPrompt());
  dispatch(addHistory('Deploying folder ' + (folder || cwd)));
  return withAuth(deploySite, dispatch, state, folder);
}

function withAuth(fn, dispatch, state, arg) {
  if (credentials) {
    return fn(dispatch, state, arg);
  }
  const auth = new Auth({site_id: 'app.netlify.com'});
  auth.authenticate({provider: 'github', scope: 'user', login: true}, (err, data) => {
    if (err) {
      return dispatch(addHistory(
        'Authentication failed :('
      ));
    }
    credentials = data;
    fn(dispatch, state, arg);
  });
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

function walkFiles(state, folder, fn)  {
  const dir = lookup(state.files, state.cwd, folder);
  Object.keys(dir).forEach((name) => {
    const fullName = folder ? `${folder}/${name}` : name;
    if (name.match(/^\./)) { return; }
    if (typeof dir[name] === 'object') {
      walkFiles(state, fullName, fn);
    } else {
      fn(fullName, dir[name]);
    }
  });
}

function deployAnimation(dispatch) {
  return new Promise((resolve, reject) => {
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
        dispatch(clearPrompt());
        return resolve();
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
  });
}

function deploySite(dispatch, state, folder) {
  const { cwd } = state;
  const sha1 = new Rusha();
  const digests = {};
  const toUpload = {};
  walkFiles(state, folder, (path, content) => {
    digests[path] = sha1.digest(content);
    toUpload[path] = content;
  });
  const api = new API({accessToken: credentials.user.access_token});
  dispatch(hidePrompt());
  dispatch(addHistory('Creating new site'));
  api.createSite({
    files: digests
  }).then((response) => {
    const uploads = [];
    Object.keys(toUpload).forEach((path) => {
      if (response.data.required.indexOf(digests[path]) > -1) {
        uploads.push(api.uploadFile(response.data.deploy_id, `/${path}`, toUpload[path]));
      }
    });
    Promise.all([
      Promise.all(uploads).then(() => api.site(response.data.subdomain)),
      deployAnimation(dispatch)
    ]).then((results) => {
      const site = results[0].data;
      dispatch(addHistory(
        '',
        'Your site has beeen deployed to:',
        '',
        `  [[${site.url}]]`,
        ''
      ));
      dispatch(addHistory(
        '',
        '__Awesome! You just deployed your first site to netlify.__',
        '__Now lets give it a better name. Try **netlify update --help**__',
        '__to see how that\'s done.__',
        ''
      ));
      dispatch(
        addFile(`${cwd}/.netlify`, `{"site_id": "${site.id}", "path": "${folder || ''}"}`)
      );
    });
  });
}
