import React from 'react';

export default class Term extends React.Component {
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
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
    this.setState({cwd: newDir});
    return [];
  }

  ls(words) {
    const cwd = this.getCwd();
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

  tabComplete() {
    const { cmd } = this.state;
    const words = cmd.split(" ").filter((w) => w);
    switch (words.length) {
      case 0:
        break;
      case 1:
        const commands = Object.keys(this.commands);
        for (var i=0; i < commands.length; i++) {
          if (words[0] === commands[i].slice(0, words[0].length)) {
            return this.setState({cmd: commands[i]});
          }
        }
      default:
        const dir = this.getCwd();
        const files = Object.keys(dir);
        const word = words[words.length-1];
        for (var i=0; i < files.length; i++) {
          if (word == files[i].slice(0,word.length)) {
            words[words.length - 1] = files[i];
            return this.setState({cmd: words.join(' ')});
          }
        }
    }
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

  handleKeyDown(e) {
    switch (e.keyCode) {
      case 8:
        const cmd = this.state.cmd.slice(0,-1);
        return this.setState({cmd, cmd});
      case 9:
        e.preventDefault();
        return this.tabComplete();
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
              onKeyDown={this.handleKeyDown}
              onKeyPress={this.handleInput}/>
        </p>
      </div>
    </div>
  }
}
