<template>
  <transition name="slide">
      <music-list :songs="songs" :title="title" :bg-image="bgImage" ></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
    import {mapGetters} from 'vuex'
    import {getSingerDetail, getMusic, getSongVkey} from "api/singer";
    import {ERR_OK} from "api/config";
    import {createSong} from "common/js/song";
    import MusicList from 'components/music-list/music-list'

    export default {
        data() {
          return {
              songs: []
          }
        },
        computed: {
            title() {
              return this.singer.name
            },
            bgImage() {
                return this.singer.avatar
            },/*
            rank() {
                return this.singer.rank
            },*/
            ...mapGetters([  //生成Vue的xx实例
                'singer'
            ])
        },
        created() {
            this._getDetail()
        },
        methods: {
            _getDetail() {
                if(!this.singer.id){  //边界处理，比如刷新时让其调到某个页面
                    this.$router.push('/singer')
                    return
                }
                getSingerDetail(this.singer.id).then((res) => {
                    if(res.code === ERR_OK) {
                        console.log(res.data.list)
                        this.songs = this._normalizeSongs(res.data.list)
                    }
                })
            },
            _normalizeSongs(list) {
                if(!list) {
                    return
                }
                let rest = []
                list.forEach((item) => {
                    /*let {musicData} = item
                    console.log(musicData)

                    if (musicData.songid && musicData.albummid) {
                        rest.push(createSong(musicData))
                    }*/
                    let {musicData} = item
                    if(musicData.songid && musicData.albummid) {
                        /*getSongVkey(musicData.songmid).then((res)=>{
                            if(res.code === ERR_OK) {
                                const filename = res.req_0.data.midurlinfo[0].filename
                                const vkey = res.req_0.data.midurlinfo[0].vkey
                                const newSong = createSong(musicData, filename, vkey)
                                console.log(newSong)
                                rest.push(newSong)
                            }
                        })*/
                        getSongVkey(musicData.songmid, res => {
                            if(res.code === ERR_OK) {
                                const filename = res.req_0.data.midurlinfo[0].filename
                                const vkey = res.req_0.data.midurlinfo[0].vkey
                                const newSong = createSong(musicData, filename, vkey)
                                console.log(newSong)
                                rest.push(newSong)
                            }
                        })
                    }

                })
                return rest
            }
        },
        components: {
            MusicList
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"

    .singer-detail
        position : fixed
        z-index : 100
        top: 0
        left: 0
        right: 0
        bottom: 0
        background : $color-background

    .slide-enter-active, .slide-leave-active
        transition : all .3s
    .slide-enter, .slide-leave-to
        transform : translate3d(100%,0,0)

</style>