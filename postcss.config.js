module.exports = {
  parser: false,
  map: false,
  plugins: {
    'postcss-import': {},
    'postcss-preset-env': {
      browsers: 'cover 99.5%, not ie <= 8, iOS > 9',
    },
  },
};
