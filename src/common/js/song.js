import {getLyric} from "api/song";
import {ERR_OK} from "api/config";
import {Base64} from "js-base64"  //解码文本（此处为歌词解析）


export default class Song {
    constructor({id, mid, singer, name, album, duration, image, url}) {
        this.id = id
        this.mid = mid
        this.singer = singer
        this.name = name
        this.album = album
        this.duration = duration
        this.image = image
        this.url = url
    }

    getLyric() {
        if(this.lyric) { //避免每次切换歌曲时都请求歌词数据
            return Promise.resolve(this.lyric)
        }

        return new Promise((resolve, reject) => {
            getLyric(this.mid).then((res) => {
                if(res.retcode === ERR_OK) {
                    this.lyric = Base64.decode(res.lyric)
                    resolve(this.lyric)
                }else {
                    reject('no lyric')
                }
            })
        })
    }
}

export function createSong(musicData, filename, vKey) {
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
        url: `http://dl.stream.qqmusic.qq.com/${filename}?guid=5416664912&vkey=${vKey}&uin=0&fromtag=66`
    })
}

export function filterSinger(singer) {
    let rest = []
    if(!singer) {
        return ''
    }
    singer.forEach((s) => {
        rest.push(s.name)
    })
    return rest.join('/')
}