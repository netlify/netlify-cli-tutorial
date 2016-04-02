import { call, take, put, fork, join, select } from 'redux-saga/effects';
import Rusha from 'rusha';
import Auth from '../lib/netlify-auth';
import API from '../lib/netlify-api';
import { lookup, walkFiles } from '../lib/filesystem';
import { addFile, addHistory, updateHistory } from '../actions/base';
import { showHelp, helpSeen } from '../actions/help';
import { setOptions, setPrompt, clearPrompt, hidePrompt } from '../actions/prompt';

let credentials = null;
let api = null;

const auth = new Auth({site_id: 'app.netlify.com'});
function oauthAuthentication(provider) {
  return new Promise((resolve, reject) => {
    auth.authenticate({provider: provider, scope: 'user', login: true}, (err, data) => {
      if (err) { return reject(err); }
      resolve(data);
    });
  });
}

const helpTexts = {
  usage: `
    Usage: netlify [options] [command]

      The premium hosting service for modern static websites

      Read more at [[https://www.netlify.com/docs/cli]]


    Commands:

      create [options]   Create a new site
      deploy [options]   Push a new deploy to netlify
      update [options]   Updates site attributes
      delete [options]   Delete site
      sites [options]    List your sites
      open [options]     Open site in the webui
      init               Configure continuous deployment

    Options:

      -h, --help                 output usage information
      -V, --version              output the version number
      -t --access-token <token>  Override the default Access Token
      -e --env <environment>     Specify an environment

`,
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


function getNetlifyCmd(state) {
  return state.npm.packages && state.npm.packages['netlify-cli'];
}

function getHelpSeen(state) {
  return state.help.seen && state.help.seen.netlify;
}

function getFirstDeploySeen(state) {
  return state.help.seen && state.help.seen.firstDeploy;
}

function getFiles(state) {
  return state.files;
}

function getCwd(state) {
  return state.cwd;
}

function getConf(state) {
  const cwd = getCwd(state);
  const file = lookup(state.files, cwd, '.netlify');
  return file ? JSON.parse(file) : null;
}

function notFound() {
  return addHistory(
    '-bash: netlify: command not found',
    '',
    '__Make sure to run **npm install netlify-cli -g** first__'
  );
}

// function* pickSite() {
//   yield authenticate();
//   if (!credentials) {
//     return yield put(addHistory(
//       'Failed to authenticate'
//     ));
//   }
//   const api = new API({accessToken: credentials.user.access_token});
//   const response = yield call([api, api.sites], {page: 1, per_page: 10});
//   yield put(setOptions('netlify', response.data.map((s, i) => `${i + 1}. ${s.name}`)));
//   const selectionResponse = yield take('NETLIFY');
//   const index = parseInt(selectionResponse.payload[0], 10);
//   yield put(clearPrompt());
//   yield put(addHistory(`Site selected ${selectionResponse.payload}`));
//   return response.data[index];
// }

function* configureDeploy() {
  yield put(setPrompt('netlify', '? No site id specified, create a new site (Y/n) '));
  const result = yield take('NETLIFY');
  if (!(result.payload[0] == null || result.payload[0].match(/^y(es)?$/i))) {
    yield put(addHistory(
      '',
      '__Deploying to an existing site is cool, but for this tutorial, lets stick with a new one__',
      ''
    ));
  }
  yield put(setPrompt('netlify', '? Path to deploy? (current dir) '));
  const pathResult = yield take('NETLIFY');
  return {path: pathResult.payload[0], siteId: null};
}

function* authenticate() {
  if (credentials) {
    return;
  }
  yield put(addHistory(
    '',
    '__At this point you\'ll need to authenticate to continue__',
    '__Please pick your prefered way:__',
    ''
  ));
  yield put(setOptions('netlify', [
    '1. GitHub',
    '2. BitBucket',
    '3. Email',
    '4. Skip'
  ]));
  const choiceResult = yield take('NETLIFY');
  const provider = choiceResult.payload[1].toLowerCase();
  if (provider !== 'skip') {
    credentials = yield call(oauthAuthentication, provider);
    api = new API({accessToken: credentials.user.access_token});
    yield put(addHistory(`Authenticated with ${provider}`));
  }
  yield put(clearPrompt());
}

function randomWait() {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 800 + 200);
  });
}

function* deployAnimation() {
  yield put(hidePrompt());
  yield put(addHistory('[                                        ] Uploading'));
  for (var i = 1; i <= 5; i++) {
    yield call(randomWait);
    var progress = '[';
    for (var j = 0; j < 40; j++) {
      if (j <= 40 * i / 5) {
        progress += '=';
      } else {
        progress += ' ';
      }
    }
    progress += '] Uploading';
    yield put(updateHistory(progress));
  }
}

function* createSite() {
  const siteResult = yield call([api, api.createSite]);
  return siteResult.data.id;
}

function* deploy() {
  const files = yield select(getFiles);
  const cwd = yield select(getCwd);
  let conf = yield select(getConf);
  if (!conf) {
    conf = configureDeploy();
  }
  yield authenticate();
  yield put(hidePrompt());
  if (!credentials) {
    yield put(addHistory(
      '',
      '__Authentication failed. Lets just do a fake demo deploy__',
      ''
    ));
    yield put(addHistory('Creating site...'));
    yield deployAnimation();
    yield put(addHistory('Congratulations - your site is live!'));
  }
  if (!conf.site_id) {
    try {
      conf.site_id = yield createSite();
    } catch (e) {
      return yield put(addHistory('Site creation failed: ', e.toString()));
    }
  }
  const sha1 = new Rusha();
  const digests = {};
  const toUpload = {};
  walkFiles(files, cwd, conf.path, (path, content) => {
    digests[path] = sha1.digest(content);
    toUpload[path] = content;
  });
  yield put(hidePrompt());
  yield put(addHistory('Analyzing folder'));
  const deployResult = yield call([api, api.createDeploy], conf.site_id, {files: digests});
  const uploads = [];
  Object.keys(toUpload).forEach((path) => {
    if (deployResult.data.required.indexOf(digests[path]) > -1) {
      uploads.push([deployResult.data.deploy_id, `/${path}`, toUpload[path]]);
    }
  });
  const animation = yield fork(deployAnimation);
  yield uploads.map((upload) => call([api, api.uploadFile], ...upload));
  const siteResult = yield call([api, api.site], conf.site_id);
  yield join(animation);
  yield put(addHistory(
    '',
    'Your site has beeen deployed to:',
    '',
    `  [[${siteResult.data.url}]]`,
    ''
  ));
  const firstDeploySeen = yield select(getFirstDeploySeen);
  if (!firstDeploySeen) {
    yield put(addHistory(
      '',
      '__Awesome! You just deployed your first site to netlify.__',
      '__Now lets give it a better name. Try **netlify update --help**__',
      '__to see how that\'s done.__',
      ''
    ));
    yield put(helpSeen('firstDeploy'));
  }
  yield put(addFile(`${cwd}/.netlify`, JSON.stringify(conf)));
  yield put(clearPrompt());
}

function* open() {
  console.log('Opening');
}

export default function* netlifySaga() {
  while (true) {
    const action = yield take('NETLIFY');
    const installed = yield select(getNetlifyCmd);

    if (!installed) {
      yield put(notFound());
      continue;
    }

    if (action.payload.length === 0) {
      yield put(addHistory(helpTexts.usage));
      const helpSeen = yield select(getHelpSeen);
      if (!helpSeen) {
        yield put(showHelp());
      }
      continue;
    }

    switch (action.payload[0]) {
      case 'deploy':
        yield deploy();
        break;
      case 'open':
        yield open();
        break;
      default:
        yield put(addHistory(helpTexts.usage));
        break;
    }
  }
}
