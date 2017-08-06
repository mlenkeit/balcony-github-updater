'use strict';

const assert = require('assert');
const execSync = require('child_process').execSync;

const githubToken = process.argv[2];
assert(githubToken, 'github token missing: node install.js GITHUB_TOKEN REPO_DIR');
const githubRepoDir = process.argv[3];
assert(githubRepoDir, 'github repo directory missing: node install.js GITHUB_TOKEN REPO_DIR');

const whichNodeBuf = execSync('which node');
const whichNode = whichNodeBuf ? whichNodeBuf.toString() : null;
assert(whichNode, 'node must be installed');
const whichForeverBuf = execSync('which forever');
const whichForever = whichForeverBuf ? whichForeverBuf.toString() : null;
assert(whichForever, 'forever must be installed');

const service = `#/etc/init.d/simple-server

case "$1" in
  start)
    exec GITHUB_TOKEN=${githubToken} GITHUB_REPO_DIR=${githubRepoDir} ${whichForever} start -p ${process.env.HOME}/.forever -c ${whichNode} ${process.env.PWD}/index.js
    ;;
  stop)
    exec ${whichForever} stopall -c ${whichNode}
    ;;
  *)
    echo "Wrong parameters"
    exit 1
    ;;
esac

exit 0;
`

console.log(service);