var express = require('express')
var config = require('./config/index')
var axios = require('axios')


const app = express()
var apiRoutes = express.Router()


/*apiRoutes.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});*/


apiRoutes.get('/apis/getSongList', function (req, res) {//这里的路径是给前端发送请求的url
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

apiRoutes.get('/apis/music', function (req, res) {//这里的路径是给前端发送请求的url
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

apiRoutes.get('/apis/lyric', function (req, res) {//这里的路径是给前端发送请求的url
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

apiRoutes.get('/apis/getSongMenu', function (req, res) {//这里的路径是给前端发送请求的url
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

apiRoutes.get('/apis/search', function (req, res) {//这里的路径是给前端发送请求的url
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

apiRoutes.get('/Vkey/cgi-bin/musicu.fcg', function (req, res) {//这里的路径是给前端发送请求的url
    const url = 'https://u.y.qq.com/cgi-bin/musicu.fcg'

    axios(url,{
        params: req.query,
        headers: {
            referer: 'https://y.qq.com/portal/player.html',
            host: 'u.y.qq.com',
            'content-type': 'text/plain; charset=utf-8'
        }
    }).then(response => {
        let rest = response.data
        if(typeof rest === 'string') {
            let reg = /^\w+\(({[^()]+})\)$/
            let matches = rest.match(reg)
            if(matches) {
                rest = JSON.parse(matches[1])
            }
        }
        res.json(rest)
    }).catch(e => {
        console.log(e)
    })

    /*let CancelToken = axios.CancelToken
    let cancel = null

    // axios发送get请求，可以自己配置config
    axios.get(url, {
        headers: {
            referer: 'https://y.qq.com/portal/player.html',
            host: 'u.y.qq.com',
            'content-type': 'text/plain; charset=utf-8'
        },
        //  params是即将与请求一起发送的url参数，无格式对象/URLSearchParams对象
        params: req.query,
        cancelToken: new CancelToken(function  executor(c) {
            cancel = c
            console.log(c) // 这个参数 c 就是CancelToken构造函数里面自带的取消请求的函数，这里把该函数当参数用
        })
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
    })*/

    /*setTimeout(() => {
        cancel()
    }, 6500)*/
})

app.use('/', apiRoutes)

app.use(express.static('./dist'))  //静态资源入口

var port = process.env.port || config.build.port

module.exports = app.listen(port, function (err) {
    if(err) {
        console.log(err)
        return
    }
    console.log('Listening at http://localhost:' + port  +'\n')
})