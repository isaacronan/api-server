const request = require('request-promise');
const express = require('express');
const chalk = require('chalk');
const btoa = require('btoa');

const CONSUMER_KEY = encodeURIComponent(''); // insert key here
const CONSUMER_SECRET = encodeURIComponent(''); // insert secret here
const CREDENTIALS = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
const EXPIRATION_THRESHOLD = 0;

let access_token = null;
let expiration_time = null;

let router = express.Router();

router.use((req, res, next) => {
  let success = (response) => {
    access_token = JSON.parse(response).access_token;
    expiration_time = JSON.parse(response).expires_in * 1000 + Date.now();
    console.log(chalk.green('Spotify tokens acquired'));
    next();
  };
  let failure = (err) => console.log(chalk.red('Unable to acquire Spotify tokens'));

  if(!access_token || !expiration_time || expiration_time - Date.now() < EXPIRATION_THRESHOLD) request({
    method: 'POST',
    headers: {
      'Authorization': `Basic ${CREDENTIALS}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'client_credentials'
    }
  }).then(success, failure);
  else next();
});

router.get('*', (req, res) => {
  console.log(req.originalUrl);
  request({
    method: 'GET',
    url: `https://api.spotify.com/v1/${/\/spotify\/(.*$)/.exec(req.originalUrl)[1]}`,
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }).then(response => res.send(response));
});

module.exports = router;
