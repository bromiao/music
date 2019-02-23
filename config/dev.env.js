'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
    apis:'"https://c.y.qq.com"',
    Vkey:'"https://u.y.qq.com"'
})
