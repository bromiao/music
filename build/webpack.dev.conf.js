'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const axios = require('axios')
// const jsonp = rqquire("../src/common/js/jsonp")

const express = require('express')
const app = express()
var apiRoutes = express.Router()

app.use('/', apiRoutes)

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    },
    before(app) {
        // 由于请求的referer和host不同，所以前端不能拿到数据，需要后端做一个代理
        //  后端向有数据的服务端发送请求，拿到数据，然后前端在向自己的服务器请求那数据
        //  这里使用axios实现ajax请求：axios是一个基于promise的HTTP库，可以用于浏览器和node.js
        // 在浏览器创建XMLHttpRequest对象，从node.js创建http请求
        app.get('/apis/getSongList', function (req, res) {//这里的路径是给前端发送请求的url
            const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
            // axios发送get请求，可以自己配置config
            axios.get(url, {
                headers: {
                    referer: 'https://c.y.qq.com/',
                    host: 'c.y.qq.com'
                },
                //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
                params: req.query
            }).then((response) => {
                res.json(response.data)
            }).catch((e) => {
                console.log(e)
            })
        })

        app.get('/apis/music', function (req, res) {//这里的路径是给前端发送请求的url
            const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
            // axios发送get请求，可以自己配置config
            axios.get(url, {
                headers: {
                    referer: 'https://y.qq.com/',
                    host: 'c.y.qq.com'
                },
                //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
                params: req.query
            }).then((response) => {
                res.json(response.data)
            }).catch((e) => {
                console.log(e)
            })
        })

        app.get('/apis/lyric', function (req, res) {//这里的路径是给前端发送请求的url
            const url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'
            // axios发送get请求，可以自己配置config
            axios.get(url, {
                headers: {
                    referer: 'https://y.qq.com/',
                    host: 'c.y.qq.com'
                },
                //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
                params: req.query
            }).then((response) => {
                let rest = response.data
                if(typeof rest === 'string') {
                    let reg = /^\w+\(({[^()]+})\)$/
                    let matches = rest.match(reg)
                    if(matches) {
                        rest = JSON.parse(matches[1])
                    }
                }
                res.json(rest)
            }).catch((e) => {
                console.log(e)
            })
        })

        app.get('/apis/getSongMenu', function (req, res) {//这里的路径是给前端发送请求的url
            const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
            // axios发送get请求，可以自己配置config
            axios.get(url, {
                headers: {
                    referer: 'https://y.qq.com/',
                    host: 'c.y.qq.com'
                },
                //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
                params: req.query
            }).then((response) => {
                res.json(response.data)
            }).catch((e) => {
                console.log(e)
            })
        })

        app.get('/apis/search', function (req, res) {//这里的路径是给前端发送请求的url
            const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
            // axios发送get请求，可以自己配置config
            axios.get(url, {
                headers: {
                    referer: 'https://m.y.qq.com/',
                    host: 'c.y.qq.com'
                },
                //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
                params: req.query
            }).then((response) => {
                res.json(response.data)
            }).catch((e) => {
                console.log(e)
            })
        })

        /*app.get('/Vkey', function (req, res) {//这里的路径是给前端发送请求的url
            const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'
            // axios发送get请求，可以自己配置config
            axios.get(url, {
                headers: {
                    referer: 'https://y.qq.com/',
                    host: 'u.y.qq.com',
                    'content-type': 'text/plain; charset=utf-8'
                },
                //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
                params: req.query
            }).then((response) => {
                let rest = response.data
                if(typeof rest === 'string') {
                    let reg = /^\w+\(({[^()]+})\)$/
                    let matches = rest.match(reg)
                    if(matches) {
                        rest = JSON.parse(matches[1])
                    }
                }
                res.json(rest)
            }).catch((e) => {
                console.log(e)
            })
        })*/
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
