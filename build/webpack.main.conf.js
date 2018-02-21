'use strict'
const path = require('path')

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    main: './src/main/main.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist/main'),
    filename: 'main.js'
  }
}