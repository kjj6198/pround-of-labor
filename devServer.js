const path = require('path');
const express = require('express');
const webpack = require('webpack');
const rawConfig = require('./webpack.config')({development: true});
const _ = require('lodash');

let oldEntry = rawConfig.entry;
let entries = _.keys(oldEntry);
let newEntry = {};
let host = 'localhost';

let hmrClient = 'webpack-hot-middleware/client?path=http://' + host + ':5000/__webpack_hmr&reload=true';

_.each(entries, function(entry) {
  newEntry[entry] = _.flatten([hmrClient, oldEntry[entry]]);
});
console.log(newEntry)

var config = _.extend(rawConfig, {
  entry: newEntry
});

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  quiet: true,
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(express.static(path.join(__dirname, 'app')));

app.use(require('webpack-hot-middleware')(compiler, {
  log: () => {}
}));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'app', 'index.html'));
});

app.listen(5000, host, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://' + host + ':5000');
});