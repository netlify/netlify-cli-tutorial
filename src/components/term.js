import React from 'react';
import { connect } from 'react-redux';
import { prompt, initFilesystem } from '../actions/base';
import { run } from '../actions/run';

class Term extends React.Component {
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {cmd: ''};
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

  runCmd() {
    const { cmd } = this.state;
    this.props.run(cmd);
    this.setState({cmd: ''});
  }

  handleInput(e) {
    if (e.key === 'Enter') {
      return this.runCmd();
    }

    const cmd = this.state.cmd + e.key;
    this.setState({cmd});
  }

  handleKeyDown(e) {
    switch (e.keyCode) {
      case 8:
        const cmd = this.state.cmd.slice(0, -1);
        return this.setState({cmd});
      case 9:
        e.preventDefault();
      //   return this.tabComplete();
    }
  }

  handleClick(e) {
    this.prompt && this.prompt.focus();
  }

  render() {
    return <div className="term" onClick={this.handleClick}>
      <div className="term--title">Terminal Demo</div>
      <div className="term--body">
        {this.props.history.map((line, i) => (
          <p className="term--history" key={i}>{line}</p>
        ))}
        <p className="term--current">
          <span className="term--prompt">{prompt}</span>
          <input
              className="term--input"
              ref={(ref) => this.prompt = ref}
              type="text"
              value={this.state.cmd}
              onKeyDown={this.handleKeyDown}
              onKeyPress={this.handleInput}
          />
        </p>
      </div>
    </div>;
  }
}

function mapStateToProps(state) {
  const { files, history } = state;
  return {
    files,
    history
  };
}

function mapDispatchToProps(dispatch) {
  return {
    run: (cmd) => dispatch(run(cmd)),
    initFilesystem: (files) => dispatch(initFilesystem(files))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Term);
