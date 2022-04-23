const { ProvidePlugin } = require("webpack");

module.exports = {
  webpack: {
    configure: webpackConfig => {

      // ts-loader is required to reference external typescript projects/files (non-transpiled)
      webpackConfig.module.rules.push({
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.json',
        },
      });

      webpackConfig.plugins.push(new ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }));

      return webpackConfig;
    }
  }
};
