const path = require('path');
const WebpackObfuscator = require('webpack-obfuscator');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'public/script.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'script.bundle.js',
  },
  devtool: false, // Disable source maps for production
  plugins: [
    new Dotenv({
        path: path.resolve(__dirname, '.env') // In case any env variables are needed in frontend, though we try to avoid it.
    }),
    new WebpackObfuscator(
      {
        rotateStringArray: true,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        unicodeEscapeSequence: false,
      },
      []
    ),
  ],
};
