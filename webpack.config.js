const path = require('path');

const slsw = require('serverless-webpack');
module.exports = {
  target: 'node',
  mode: 'production', 
  entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  externals : [{ 'aws-sdk': 'commonjs aws-sdk' }]
};
