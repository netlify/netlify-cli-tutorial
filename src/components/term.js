import React from 'react';

export default class Term extends React.Component {
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      cmd: "",
      history: ['type help to show available commands'],
      prompt: '$ ',
      files: {
        "static-site": {
          "index.html": "<h1>I am the index</h1>"
        },
        "jekyll-site": {
          "_config.yml": "---\n\ntitle: My Jekyll Site\n"
        },
        "README": "Hello, World!"
      },
      cwd: ''
    }
    // Each command returns an array of lines to add to history
    this.commands = {
      cd: this.cd,
      ls: this.ls,
      cat: this.cat,
      help: this.help
    }
  }

  componentDidMount() {
    this.prompt && this.prompt.focus();
  }

  getDir(dir) {
    console.log('Getting dir: %o', dir);
    const { files } = this.state;
    const segments = dir.split('/').filter((s) => s);
    return segments.reduce(((dir, segment) => dir && dir[segment]), files);
  }

  getCwd() {
    return this.getDir(this.state.cwd);
  }

  help() {
    return [
      'ls -- list directory contents',
      'cat -- concatenate and print files',
      'cd -- change directory',
      'help -- this help text'
    ]
  }

  cd(words) {
    const { cwd } = this.state;
    const dir = words[0];
    let newDir = dir;
    if (dir && dir.match(/^\//)) {
      if (this.getDir(dir)) {
        newDir = dir;
      } else {
        return [`-bash: cd: ${dir}: No such file or directory`];
      }
    } else if (dir === '..') {
      newDir = cwd.split('/').slice(0,-1).join('/');
    } else if (dir) {
      newDir = cwd + '/' + dir;
      if (!this.getDir(newDir)) {
        return [`-bash: cd: ${newDir}: No such file or directory`];
      }
    } else {
      newDir = '';
    }
    console.log(`setting cwd: ${newDir}`);
    this.setState({cwd: newDir});
    return [];
  }

  ls(words) {
    const cwd = this.getCwd();
    console.log('got cwd: %o', cwd);
    let lines = []
    if (words.length) {
      for (var i=0; i<words.length; i++) {
        let word = words[i];
        let file = cwd[word];
        if (file && typeof(file) === 'object') {
          lines.push(Object.keys(file));
        } else if (file) {
          lines.push(word);
        } else {
          lines.push(`ls: ${words.join(" ")}: No such file or directory`);
          return lines;
        }
      }
    } else {
      lines = Object.keys(cwd);
    }
    return lines;
  }

  cat(words) {
    const cwd = this.getCwd();
    const lines = []
    for(var i=0; i<words.length; i++) {
      let word = words[i];
      let file = cwd[word];
      if (file && typeof(file) === 'string') {
        lines.push(file);
      } else if (file) {
        lines.push(`cat: ${word}: Is a directory`);
        return lines;
      } else {
        lines.push(`cat: ${word}: No such file or directory`);
        return lines
      }
    }
    return lines;
  }

  addHistory(lines) {
    const history = this.state.history.concat(lines);
    this.setState({history: history, cmd: ""});
  }

  runCmd() {
    const { cmd, prompt } = this.state;
    const words = cmd.split(" ").filter((w) => w);
    const handler = this.commands[words[0]];
    const lines = [];
    lines.push(prompt + cmd);
    if (handler) {
      handler.call(this, words.slice(1)).map((output) => { lines.push(output); });
    } else {
      lines.push("-bash: " + cmd + ": command not found");
    }
    this.addHistory(lines);
  }

  handleInput(e) {
    if (e.key === 'Enter') {
      return this.runCmd();
    }

    const cmd = this.state.cmd + e.key;
    this.setState({cmd, cmd});
  }

  handleKeyUp(e) {
    if (e.keyCode === 8) {
      // Backspace
      const cmd = this.state.cmd.slice(0,-1);
      this.setState({cmd, cmd});
    }
  }

  handleClick(e) {
    this.prompt && this.prompt.focus()
  }

  render() {
    return <div className="term" onClick={this.handleClick}>
      <div className="term--title">Terminal Demo</div>
      <div className="term--body">
        {this.state.history.map((line, i) => (
          <p className="term--history" key={i}>{line}</p>
        ))}
        <p className="term--current">
          <span className="term--prompt">{this.state.prompt}</span>
          <input
              className="term--input"
              ref={(ref) => this.prompt = ref}
              type="text"
              value={this.state.cmd}
              onKeyUp={this.handleKeyUp}
              onKeyPress={this.handleInput}/>
        </p>
      </div>
    </div>
  }
}
