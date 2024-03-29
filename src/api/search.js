import {commonParams, options} from "./config";
import jsonp from "common/js/jsonp";
import axios from 'axios'


export function getHotKey() {
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    const data = Object.assign({}, commonParams, {
        uin: 0,
        needNewCode: 1,
        platform: 'h5'
    })

    return jsonp(url, data, options)
}

export function search(query, page, showSinger, perpage) {
    const url = '/apis/search'

    const data = Object.assign({}, commonParams, {
        w: query,
        p: page,
        perpage,
        n: perpage,
        catZhida: showSinger ? 1 : 0,
        zhidaqu: 1,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        remoteplace: 'txt.mqq.all',
        uin: 0,
        needNewCode: 1,
        platform: 'h5',
        format: 'json'
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}