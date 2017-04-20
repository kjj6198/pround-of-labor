const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");


PATH = {
  stylesheets: path.join(__dirname, 'app', 'styles'),
  bower: path.join(__dirname, 'bower_components', 'sexy', 'src'),
  image: path.join(__dirname, 'app', 'img'),
  config: path.join(__dirname, 'config.json'),
  javascripts: path.join(__dirname, 'app', 'js'),
}

const setEnv = (env) => {
  if (env.development) {
    return new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('developmemt')
      }
    })
  } else {
    return new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  }
}

module.exports = (env) => {
  let plugins = [
     setEnv(env)
  ];
  
  if (env.development) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if (env.production) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: process.env.NODE_ENV === 'production'
    }));

    plugins.push(new ExtractTextPlugin({
      filename: '../../styles/bundle.scss',
      allChunks: true
    }));
  }

  return {
    context: __dirname,
    resolve: {
      modules: [
        PATH.javascripts,
        PATH.bower,
        PATH.stylesheets,
        'node_modules',
      ],
      alias: {
        "~sexy": "./bower_components/sexy/src/sexy.scss"
      }
    },
    devtool: env.production ? 'source-map' : 'eval',
    entry: {
      app: 'app.js',
    },
    output: {
      path: path.join(PATH.javascripts, 'bundle'),
      filename: '[name].bundle.js',
      publicPath: 'http://localhost:5000/bundle',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loaders: ['ts-loader']
        },
        {
          test: /\.js$/,
          loaders: [ 
            'babel-loader'
          ]
        },
        {
          test: /\.(sass|scss)$/,
          exclude: /settings/,
          loaders: env.production ? ExtractTextPlugin.extract({
            use: [
              'css-loader?sourceMap=true',
              'sass-loader?sourceMap=true'  
            ]
          }) : [
            'style-loader?sourceMap=true',
            'css-loader?sourceMap=true',
            'sass-loader?sourceMap=true'
          ]
        }
      ]
    },
    plugins: plugins
  }
}
