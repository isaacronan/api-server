const express = require('express');
const chalk = require('chalk');
const request = require('request-promise');

const spotify = require('./routes/spotify');
const twitter = require('./routes/twitter');

const PORT = 4096;

let app = express();

app.use('/spotify', spotify);
app.use('/twitter', twitter);

app.listen(PORT, () => {
  console.log(chalk.blue(`Listening on port ${PORT}...`));
});
