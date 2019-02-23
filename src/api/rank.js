import jsonp from 'common/js/jsonp'
import {commonParams, options} from "./config";
import axios from 'axios'


export function getTopList() {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        uin: 0,
        needNewCode: 1
    })

    return jsonp(url, data, options)
}

export function getMusicList(topid) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

    const data = Object.assign({}, commonParams, {
        tpl: 3,
        page: 'detail',
        topid: topid,
        type: 'top',
        song_begin: 0,
        song_num: 50,
        hostUin: 0,
        needNewCode: 0
    })

    return jsonp(url, data, options)
}