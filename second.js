'use strict';

const bodyParser = require('body-parser');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const express = require('express');
const fs = require('fs');
const localtunnel = require('localtunnel');
const request = require('request');
const path = require('path');

const apiToken = process.env.API_TOKEN;

const tunnel = localtunnel(3000, function(err, tunnel) {
    if (err) {
      return console.log('err', err);
    }
    console.log('url', tunnel.url);
    
    request.put({
      uri: 'http://ml-balcony-server.herokuapp.com/linque',
      json: {
        url: tunnel.url
      },
      headers: {
        Authorization: `token ${apiToken}`
      }
    }, (err, res, body) => {
      console.log('err', err);
      console.log(body);
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
