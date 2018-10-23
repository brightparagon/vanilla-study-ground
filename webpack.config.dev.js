const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const DEVSERVER_PORT = 3000;

const resolvedPaths = {
  scriptPath: path.resolve(__dirname, 'src'),
  public: path.resolve(__dirname, 'public'),
  outputPath: path.resolve(__dirname, 'dist'),
  outputStaticPath: path.resolve(__dirname, 'dist/static'),
  publicPath: path.resolve(__dirname, 'public'),
};

const filePaths = {
  htmlFilePath: path.join(resolvedPaths.publicPath, 'index.html'),
  entryFilePath: path.join(resolvedPaths.scriptPath, 'index.js'),
  bundledFilePath: path.join('static/js', 'bundle.js'),
  bundledChunkFilePath: path.join('static/js', '[name].chunk.js'),
};

const regExps = {
  js: /\.(js|mjs)$/,
  styleSheet: /\.(sc|sa|c)ss$/,
  imageFiles: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
  fileLoaderExcluded: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
  nodeModules: /node_modules/,
};

const devserverConfig = {
  host: '127.0.0.1',
  contentBase: resolvedPaths.public,
  watchContentBase: true,
  compress: true,
  port: DEVSERVER_PORT,
  inline: true,
  hot: true,
  historyApiFallback: true,
  overlay: true,
  watchOptions: {
    poll: true,
  },
};

const loaderOptions = {
  eslintLoader: {
    enforce: 'pre',
    test: regExps.js,
    exclude: regExps.nodeModules,
    loader: require.resolve('eslint-loader'),
    options: {
      formatter: require.resolve('eslint-friendly-formatter'),
      emitWarning: true,
      quiet: true,
    },
  },
  babelLoader: {
    test: regExps.js,
    loader: require.resolve('babel-loader'),
    include: resolvedPaths.scriptPath,
    exclude: regExps.nodeModules,
    options: {
      presets: ['@babel/preset-env'],
    },
  },
  styleLoader: {
    test: regExps.styleSheet,
    use: [
      { loader: require.resolve('style-loader') },
      { loader: require.resolve('css-loader') },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss',
          plugins: () => [
            require.resolve('postcss-flexbugs-fixes'),
            require.resolve('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
          ],
        },
      },
      { loader: require.resolve('sass-loader') },
    ],
  },
  fileLoader: {
    oneOf: [
      {
        test: regExps.imageFiles,
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: '/assets/[name].[hash:8].[ext]',
        },
      },
    ],
  },
  urlLoader: {
    exclude: regExps.fileLoaderExcluded,
    loader: require.resolve('file-loader'),
    options: {
      name: 'static/assets/[name].[hash:8].[ext]',
    },
  },
};

module.exports = {
  mode: 'development',
  target: 'web',
  devtool: 'cheap-eval-source-map',
  context: resolvedPaths.scriptPath,
  devServer: devserverConfig,
  entry: {
    app: [
      '@babel/polyfill',
      filePaths.entryFilePath,
    ],
  },
  output: {
    path: resolvedPaths.outputPath,
    filename: filePaths.bundledFilePath,
    chunkFilename: filePaths.bundledChunkFilePath,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.mjs', '.json'],
    mainFiles: ['index'],
    modules: [resolvedPaths.scriptPath, 'node_modules'],
  },
  module: {
    rules: [
      loaderOptions.eslintLoader,
      loaderOptions.babelLoader,
      loaderOptions.styleLoader,
      loaderOptions.fileLoader,
      loaderOptions.urlLoader,
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: filePaths.htmlFilePath,
    }),
    new CleanWebpackPlugin(['dist'], {
      verbose: true,
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
};
