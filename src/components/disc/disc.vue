<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getSongMenu} from "api/recommend";
import {ERR_OK} from "api/config";
import {createSong} from "common/js/song";
import {getSongVkey} from 'api/singer'

export default {
    data() {
      return {
        songs: []
      }
    },
    computed: {
        title() {
            return this.disc.dissname
        },
        bgImage() {
            return this.disc.imgurl
        },
        ...mapGetters([
            'disc'
        ])
    },
    created() {
        this._getSongMenu()
    },
    methods: {
        _getSongMenu() {
            if(!this.disc.dissid) {
                this.$router.push('/recommend')
                return
            }
            getSongMenu(this.disc.dissid).then((res) => {
                if(res.code === ERR_OK) {
                    console.log(res.cdlist[0].songlist)
                    // this.songs = this._normalizeSongs(res.cdlist[0].songlist)
                    this._normalizeSongs(res.cdlist[0].songlist, (rest) => {
                        this.songs = rest
                    })
                }
            })
        },
        _normalizeSongs(list, callback) {
            if(!list) {
                return
            }
            let rest = []
            let index = 1
            list.forEach((musicData) => {
                if(musicData.songid && musicData.albummid !==undefined) {
                    /*let promise = getSongVkey(musicData.songmid) //获取歌曲filename及vkey
                    promise.then((res) => {
                        if(res.code === ERR_OK) {
                            const resData = res.req_0.data.midurlinfo[0]
                            const filename = resData.filename
                            const vKey = resData.vkey
                            const newSong = createSong(musicData, filename, vKey)
                            // console.log(newSong)
                            rest.push(newSong)  //将获取到的歌曲加入到数组中
                            if(index === list.length) {
                                console.log(resData)
                                callback && callback(rest)
                            }
                            index++
                        }
                    })*/
                    getSongVkey(musicData.songmid, res => {
                        console.log(res)
                        if(res.code === ERR_OK) {
                            const resData = res.req_0.data.midurlinfo[0]
                            const filename = resData.filename
                            const vKey = resData.vkey
                            const newSong = createSong(musicData, filename, vKey)
                            // console.log(newSong)
                            rest.push(newSong)  //将获取到的歌曲加入到数组中
                            if(index === list.length) {
                                console.log(resData)
                                callback && callback(rest)
                            }
                            index++
                        }
                    })
                }
            })
        }
        /*_normalizeSongs(list) {
            let rest = []
            list.forEach((musicData) => {
                if(musicData.songid && musicData.albumid) {
                    rest.push(createSong(musicData))
                }
            })
            return rest
        }*/
    },
    components: {
        MusicList
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>