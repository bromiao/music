import {commonParams, options} from "./config";
import jsonp from "common/js/jsonp";
import axios from 'axios'


export function getSingerList() {
    const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'

    const data = Object.assign({}, commonParams, {
        channel: 'singer',
        page: 'list',
        key: 'all_all_all',
        pagesize: 100,
        pagenum: 1,
        hostUin: 0,
        needNewCode: 0,
        platform: 'yqq'
        // g_tk: 1664029744
    })

    return jsonp(url, data, options)
}

export function getSingerDetail(singermid){
    var url = '/apis/music';

    const data = Object.assign({}, commonParams, {
        loginUin: 0,
        hostUin: 0,
        format: 'json',
        notice: 0,
        platform: 'yqq',
        needNewCode: 0,
        singermid: singermid,
        order: 'listen',
        begin: 0,
        num: 100,
        songstatus: 1
    })

    return axios.get(url,{
        params:data
    }).then((res) => {
        return Promise.resolve(res.data)
    }).catch((e) => {
        console.log(e)
    })
}

export function getSongVkey (songmid, callback) { // 获取歌曲的vkey

    const data = Object.assign({}, commonParams, {
        "-": 'getplaysongvkey88861133588992',
        loginUin: 0,
        hostUin: 0,
        format: 'json',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0,
        data: `{"req":{"module":"CDN.SrfCdnDispatchServer","method":"GetCdnDispatch","param":{"guid":"5416664912","calltype":0,"userip":""}},"req_0":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"5416664912","songmid":["${songmid}"],"songtype":[0],"uin":"0","loginflag":1,"platform":"20"}},"comm":{"uin":0,"format":"json","ct":20,"cv":0}}`
    })
    axios('/Vkey/cgi-bin/musicu.fcg',{
        params: data,
        headers: {
            'content-type': 'text/plain; charset=utf-8'
        }
    }).then(response=>{
        callback(response.data)
    }).catch(error=>{
        callback(error)
    })


    /*const url = '/apis/getVkey'

    const data = Object.assign({}, commonParams, {
        "-": 'getplaysongvkey88861133588992',
        loginUin: 0,
        hostUin: 0,
        format: 'json',
        notice: 0,
        platform: 'yqq.json',
        needNewCode: 0,
        data: `{"req":{"module":"CDN.SrfCdnDispatchServer","method":"GetCdnDispatch","param":{"guid":"5416664912","calltype":0,"userip":""}},"req_0":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"5416664912","songmid":["${songmid}"],"songtype":[0],"uin":"0","loginflag":1,"platform":"20"}},"comm":{"uin":0,"format":"json","ct":20,"cv":0}}`
    })

    let CancelToken = axios.CancelToken
    let cancel = null

    let vKey = axios.get(url,{
        params: data,
        cancelToken: new CancelToken(function  executor(c) {
            cancel = c
            console.log(c) // 这个参数 c 就是CancelToken构造函数里面自带的取消请求的函数，这里把该函数当参数用
        })
    }).then((res) => {
      return  Promise.resolve(res.data)
    }).catch((e) => {
        console.log(e)
    })

    /!*setTimeout(() => {
        cancel()
    }, 6500)*!/

    return vKey*/


}

