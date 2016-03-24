import React from 'react';
import { connect } from 'react-redux';
import { prompt, initFilesystem, appendCmd, setCmd } from '../actions/base';
import { run, autocomplete, popHistory } from '../actions/run';

class Term extends React.Component {
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.props.initFilesystem({
      'static-site': {
        'index.html': '<h1>I am the index</h1>'
      },
      'jekyll-site': {
        '_config.yml': '---\n\ntitle: My Jekyll Site\n'
      },
      'README': 'Hello, World!'
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
  }

  componentDidUpdate() {
    this.term.scrollTop = this.term.scrollHeight;
  }

  render() {
    return <div className="term" onClick={this.handleClick}>
      <pre className="term--body" ref={(ref) => this.term = ref}>
        {this.props.history.map((line, i) => (
          <div className="term--history" key={i}>{line || <br/>}</div>
        ))}
        <div className="term--current">
          <span className="term--prompt">{prompt}</span>
          <input
              className="term--input"
              ref={(ref) => this.prompt = ref}
              type="text"
              value={this.props.cmd}
              onKeyDown={this.handleKeyDown}
              onKeyPress={this.handleInput}
          />
        </div>
      </pre>
    </div>;
  }
}

function mapStateToProps(state) {
  const { cmd, files, history } = state;
  return {
    cmd,
    files,
    history
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
