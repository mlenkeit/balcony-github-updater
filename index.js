'use strict';

const bodyParser = require('body-parser');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const express = require('express');
const localtunnel = require('localtunnel');
const request = require('request');

const githubToken = process.env.GITHUB_TOKEN;
const githubRepoDir = process.env.GITHUB_REPO_DIR;

console.log('GitHub Token', githubToken);
console.log('Repository', githubRepoDir);

const tunnel = localtunnel(5000, function(err, tunnel) {
    if (err) {
      return console.log('err', err);
    }
    console.log('url', tunnel.url);
    
    request.patch({
      uri: 'https://api.github.com/repos/mlenkeit/balcony-server/hooks/15385551',
      json: {
        config: {
          content_type: 'json',
          url: tunnel.url
        }
      },
      auth: {
        username: 'mlenkeit',
        password: githubToken
      },
      headers: {
        'User-Agent': 'mlenkeit'
      }
    }, (err, res, body) => {
      console.log('err', err);
      console.log(body);
      
      const app = express();

      app.post('/', bodyParser.json(), (req, res) => {
        console.log('Receiving request');
        // console.log(req.body);
        const json = req.body;
        res.status(201).json({});
        if (json.context !== 'continuous-integration/travis-ci/push' || json.state !== 'success') {
          console.log('irrelevant');
          return;
        }
        console.log('from travis :)');
        const commit = json.sha;
        console.log('commit', commit);
        
        const stdout = execSync('git fetch -a && git reset --hard origin/master', {
          cwd: githubRepoDir,
          env: process.env
        });
        console.log('executing git', stdout.toString());

        process.env.NVM_DIR = '/root/.nvm';        
        exec('[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && npm install', {
          cwd: githubRepoDir,
          env: process.env
        }, function(err, stdout) {
          console.log('err', err);
          console.log('stdout', stdout.toString());

          exec('/etc/init.d/server-pi restart', function(err, stdout) {
            console.log('err', err);
            console.log('stdout', stdout.toString());
          });
        });
      });

      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
      });
    });
});

tunnel.on('close', function() {
    console.log('tunnel closing');
    process.exit();
});

tunnel.on('error', function() {
  console.log('tunnel error');
  process.exit();
});
