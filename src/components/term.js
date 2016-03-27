import React from 'react';
import { connect } from 'react-redux';
import { initFilesystem, appendCmd, setCmd } from '../actions/base';
import { run, autocomplete, popHistory } from '../actions/run';

const banner = `
                               ::   :::    :::::
                        :::    ::         :::
                        :::    ::         :::
:: ::::::    ,::::::  ::::::,  ::   ::: ,::::::  :::    :::
:::   :::   :::   :::   :::    ::   :::   :::    :::    :::
::     ::: :::     ::   :::    ::   :::   :::     ::,  :::
::     ::: ::::::::::   :::    ::   :::   :::     ,::  ::,
::     ::: ::,          :::    ::   :::   :::      :::,::
::     ::: ,::          :::    ::   :::   :::       ::::
::     :::  :::::::::   :::::  ::   :::   :::       ::::
,,     ,,,     :::,       ::,  ,,   ,,,   ,,,        ::
                                                    :::
                                                 ,::::
                                                  ,,
`;

class Term extends React.Component {
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.bindTermRef = this.bindTermRef.bind(this);
    this.bindPromptRef = this.bindPromptRef.bind(this);
  }

  componentDidMount() {
    this.props.initFilesystem({
      'static-site': {
        'index.html': '<h1>Hello, World!</h1>'
      },
      'jekyll-site': {
        '_config.yml': '---\n\ntitle: Hello, Jekyll World!\n'
      },
      'README': `
# Netlify\'s CLI Tutorial

This is an interactive demonstration of some of the netlify CLI features.

You'll see help messages in __a different color__ and you can click on any
__**highlighted block**__ to copy those words to the prompt.

If you go through the whole tutorial, you'll learn how to:

* Do a manual deploy of a site folder
* Manage environments
* Password protect your staging site
* Set up continuous deployment
* Name your site
* Configure a custom domain

## Run into a bug?

Great! Help us squash it! Open an issue or fork this tutorial and send us a
pull request:

https://github.com/netlify/netlify-cli-tutorial

`
    });
    this.prompt && this.prompt.focus();
  }

  handleInput(e) {
    if (e.key === 'Enter') {
      return this.props.run();
    }
    this.props.appendCmd(e.key);
  }

  handleKeyDown(e) {
    switch (e.keyCode) {
      case 8:
        const cmd = this.props.cmd.slice(0, -1);
        return this.props.setCmd(cmd);
      case 9:
        e.preventDefault();
        this.props.autocomplete();
        break;
      case 38:
        this.props.popHistory();
    }
  }

  handleClick(e) {
    this.prompt && this.prompt.focus();
    if (e.target.tagName === 'STRONG') {
      this.props.setCmd(e.target.textContent);
    }
  }

  componentDidUpdate() {
    this.term.scrollTop = this.term.scrollHeight;
    this.prompt && this.prompt.focus();
  }

  format(line) {
    if (!line) { return {__html: '<br/>'}; }
    return {
      __html: line
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, (m, bold) => (
          `<strong>${bold}</strong>`
        ))
        .replace(/__(.+?)__/g, (m, em) => (
          `<em>${em}</em>`
        ))
        .replace(/\[\[(.+?)\]\]/g, (m, link) => (
          `<a href="${link}" target="_blank">${link}</a>`
        ))
    };
  }

  bindTermRef(ref) {
    this.term = ref;
  }

  bindPromptRef(ref) {
    this.prompt = ref;
  }

  render() {
    const { prompt } = this.props;


    return <div className="term" onClick={this.handleClick} ref={this.bindTermRef}>
      <pre className="term--body">
        <div className="term--banner">{banner}</div>
        {this.props.history.map((line, i) => (
          <div
              key={i}
              className="term--history"
              dangerouslySetInnerHTML={this.format(line)}
          />
        ))}
        {prompt && <div className="term--current">
          <span
              className="term--prompt"
              dangerouslySetInnerHTML={this.format(prompt)}
          />
          <input
              className="term--textfield"
              ref={this.bindPromptRef}
              type="text"
              value={this.props.cmd}
              onKeyDown={this.handleKeyDown}
              onKeyPress={this.handleInput}
          />
          <span className="term--input">{this.props.cmd}</span>
          <span className="term--caret"></span>
        </div>}
      </pre>
    </div>;
  }
}

function mapStateToProps(state) {
  const { cmd, files, history, prompt } = state;
  return {
    cmd,
    files,
    history,
    prompt: prompt.text
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCmd: (cmd) => dispatch(setCmd(cmd)),
    appendCmd: (char) => dispatch(appendCmd(char)),
    run: (cmd) => dispatch(run(cmd)),
    autocomplete: () => dispatch(autocomplete()),
    popHistory: () => dispatch(popHistory()),
    initFilesystem: (files) => dispatch(initFilesystem(files))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Term);
