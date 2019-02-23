import {commonParams} from "./config";
import axios from 'axios'


export function getLyric(songmid) {
    const url = '/apis/lyric'

    const data = Object.assign({}, commonParams, {
        songmid: songmid,
        pcachetime: +new Date(),
        g_tk: 5381,
        hostUin: 0,
        platform: 'yqq',
        needNewCode: 0,
        format: 'json'
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}
