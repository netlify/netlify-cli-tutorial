import { addHistory } from './base';

export function helpSeen(msg) {
  return {
    type: 'HELP_SEEN',
    payload: msg
  };
}

export function showHelp() {
  return (dispatch, getState) => {
    const { npm, cwd } = getState();

    if (!npm.packages['netlify-cli']) {
      return dispatch(addHistory(
        '',
        'First step is to install netlify\'s command line tool.',
        'Type \'npm install netlify-cli -g\' to install and get started',
        ''
      ));
    }

    switch (cwd) {
      case 'static-site':
        dispatch(helpSeen(cwd));
        return dispatch(addHistory(
          '',
          'This is a simple static site. Lets push it to netlify now.',
          'Run \'netlify deploy\' and pick the default settings to',
          'push this site to our global CDN',
          ''
        ));
      case 'jekyll-site':
        dispatch(helpSeen(cwd));
        return dispatch(addHistory(
          '',
          'This is a simple jekyll site.',
          'Lets try to run a build by doing \'jekyll build\'',
          ''
        ));
      default:
        dispatch(helpSeen('netlify'));
        return dispatch(
          addHistory(
            '',
            'Try changing the current working directory to one of the demo sites',
            '(hint: use the \'ls\' and \'cd\' to navigate)',
            ''
          )
        );
    }
  };
}
