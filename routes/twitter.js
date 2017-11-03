const request = require('request-promise');
const express = require('express');
const chalk = require('chalk');
const btoa = require('btoa');

const CONSUMER_KEY = encodeURIComponent(''); // insert key here
const CONSUMER_SECRET = encodeURIComponent(''); // insert secret here
const CREDENTIALS = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
const EXPIRATION_THRESHOLD = 10 * 1000;

let access_token = null;
let expiration_time = null;

let router = express.Router();

router.use((req, res, next) => {
  let success = (response) => {
    access_token = JSON.parse(response).access_token;
    expiration_time = null;
    console.log(chalk.green('Twitter tokens acquired'));
    next();
  };
  let failure = (err) => console.log(chalk.red('Unable to acquire Twitter tokens'));

  if(!access_token || expiration_time - Date.now() < EXPIRATION_THRESHOLD) request({
    method: 'POST',
    headers: {
      'Authorization': `Basic ${CREDENTIALS}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    url: 'https://api.twitter.com/oauth2/token',
    form: {
      grant_type: 'client_credentials'
    }
  }).then(success, failure);
  else next();
});

router.use((req, res, next) => {
  let success = (response) => {
    expiration_time = JSON.parse(response).resources.search["/search/tweets"].reset * 1000;
    console.log(chalk.green('Twitter token expiration time acquired'));
    next();
  };
  let failure = (err) => console.log(chalk.red('Unable to acquire Twitter token expiration time'));

  if(!expiration_time) request({
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${access_token}`
    },
    url: 'https://api.twitter.com/1.1/application/rate_limit_status.json'
  }).then(success, failure);
  else next();
});

router.get('*', (req, res) => {
  console.log(req.originalUrl);
  request({
    method: 'GET',
    url: `https://api.twitter.com/1.1/${/\/twitter\/(.*$)/.exec(req.originalUrl)[1]}`,
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  }).then(response => res.send(response));
});

module.exports = router;
