<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
    import MusicList from 'components/music-list/music-list'
    import {mapGetters} from 'vuex'
    import {getMusicList} from "api/rank";
    import {ERR_OK} from "api/config";
    import {createSong} from "common/js/song";
    import {getSongVkey} from 'api/singer'

    export default {
        computed: {
            title() {
                return this.topList.topTitle
            },
            bgImage() {
                return this.topList.picUrl
            },
            ...mapGetters([
                'topList'
            ])
        },
        data() {
            return {
                songs: [],
                rank: true
            }
        },
        created() {
            this._getMusicList()
        },
        methods: {
            _getMusicList() {
                if(!this.topList.id) {
                    this.$router.push('/rank')
                    return
                }
                getMusicList(this.topList.id).then((res) => {
                    if(res.code === ERR_OK) {
                        // this.songs = this._normalizeSongs(res.songlist)
                        this._normalizeSongs(res.songlist, (rest) => {
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
                list.forEach((item) => {
                    const musicData = item.data
                    if(musicData.songid && musicData.albummid !==undefined) {
                        /*let promise = getSongVkey(musicData.songmid) //获取歌曲filename及vkey
                        promise.then((res) => {
                            if(res.code === ERR_OK) {
                                const resData = res
                                const filename = resData.req_0.data.midurlinfo[0].filename
                                const vkey = resData.req_0.data.midurlinfo[0].vkey
                                const newSong = createSong(musicData, filename, vkey)
                                // console.log(newSong)
                                rest.push(newSong)  //将获取到的歌曲加入到数组中
                                if(index === list.length) {
                                    callback && callback(rest)
                                }
                                index++
                            }
                        })*/
                        getSongVkey(musicData.songmid, res => {
                            if(res.code === ERR_OK) {
                                const filename = res.req_0.data.midurlinfo[0].filename
                                const vkey = res.req_0.data.midurlinfo[0].vkey
                                const newSong = createSong(musicData, filename, vkey)
                                // console.log(newSong)
                                rest.push(newSong)  //将获取到的歌曲加入到数组中
                                if(index === list.length) {
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
                list.forEach((item) => {
                    const musicData = item.data
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
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>