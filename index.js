'use strict';

const bodyParser = require('body-parser');
const express = require('express');

const app = express();

app.post('/', bodyParser.json(), (req, res) => {
  console.log('Receiving request');
  console.log('Payload', req.body);
  res.status(201).json({});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});