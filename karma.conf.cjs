module.exports = (config) => {
  config.set({
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
    ],
    reporters: ['progress'],
    client: {
      clearContext: false,
      jasmine: {
        random: false,
      },
    },
    restartOnFileChange: true,
    coverageReporter: {
      check: {
        global: {
          statements: 82,
          branches: 82,
          functions: 82,
          lines: 82,
        },
      },
    },
  });
};
