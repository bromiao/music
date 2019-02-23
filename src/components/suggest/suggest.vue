<template>
    <scroll
            ref="suggest"
            class="suggest"
            :data="result"
            :pullup="pullup"
            :beforeScroll="beforeScroll"
            @scrollToEnd="searchMore"
            @beforeScroll="listScroll"
    >
        <ul class="suggest-list">
          <li @click="selectItem(item)" class="suggest-item" v-for="item in result">
              <div class="icon">
                  <i :class="getIconCls(item)"></i>
              </div>
              <div class="name">
                  <p class="text" v-html="getDisplayName(item)"></p>
              </div>
          </li>
          <loading  v-show="hasMore"></loading>
        </ul>
        <div v-show="!hasMore && !result.length" class="no-result-wrapper">
            <no-result title="抱歉，暂无搜索结果"></no-result>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import {search} from "api/search";
  import {ERR_OK} from "api/config";
  import {createSong} from "common/js/song";
  import Loading from 'base/loading/loading'
  import Singer from 'common/js/singer'
  import {mapMutations, mapActions} from 'vuex'
  import {getSongVkey} from 'api/singer'
  import NoResult from 'base/no-result/no-result'

  const TYPE_SINGER = 'singer'
  const Perpage = 30

  export default {
    props: {
      showSinger: {
        type: Boolean,
        default: true
      },
      query: {
        type: String,
        default: ''
      }
    },
    data() {
        return {
            page: 1,
            result: [],
            pullup: true,
            beforeScroll: true,
            hasMore: true
        }
    },
    methods: {
        refresh() {
            this.$refs.suggest.refresh()
        },
        searchMore() {
            if(!this.hasMore) {
                return
            }
            this.page++
            search(this.query, this.page, this.showSinger, Perpage).then((res) => {
                if(res.code === ERR_OK) {
                    this._genResult(res.data, (rest) => {
                        this.result = this.result.concat(rest) //把新搜索到的数据拼接到之前搜索到的数据中
                        this._checkMore(res.data)
                    })
                }
            })
        },
        listScroll() {
            this.$emit('listScroll')
        },
        getIconCls(item) {
            if(item.type === TYPE_SINGER) {
                return 'icon-mine'
            }else {
                return 'iconfont icon-music'
            }
        },
        getDisplayName(item) {
            if(item.type === TYPE_SINGER) {
                return item.singername
            }else {
                return `${item.name}-${item.singer}`
            }
        },
        selectItem(item) {
            if(item.type === TYPE_SINGER) {
                const singer = new Singer({
                    id: item.singermid,
                    name: item.singername
                })
                this.$router.push({
                    path: `/search/${singer.id}`
                })
                this.setSinger(singer)
            }else {
                this.insertSong(item)
            }

            this.$emit('select', item)
        },
        search() {
            this.result = []
            this.hasMore = true
            this.page = 1   //当query发生改变时，page重置为1
            this.$refs.suggest.scrollTo(0, 0)
            search(this.query, this.page, this.showSinger, Perpage).then((res) => {
                if(res.code === ERR_OK) {
                    this._genResult(res.data, (rest) => {
                        this.result = rest
                        this._checkMore(res.data)
                    })
                }
            })
        },
        _checkMore(data) {
            const song = data.song
            if(!song.list.length || (song.curnum + song.curpage * Perpage) >= song.totalnum) {
                this.hasMore = false
            }
        },
        _genResult(data, callback) {
            let rest = []
            if(data.zhida && data.zhida.singername) {
                rest.push({...data.zhida,...{type: TYPE_SINGER}})
            }
            if(data.song) {
                this._normalizeSongs(data.song.list, (restdata) => {
                    rest = rest.concat(restdata)
                    callback && callback(rest)
                })
            }
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
        },
        ...mapMutations({
            setSinger: 'SET_SINGER'
        }),
        ...mapActions([
            'insertSong'
        ])
    },
    watch: {
        query(newQuery) {
            this.search(newQuery)
        }
    },
    components: {
      Scroll,
      Loading,
      NoResult
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
    @import "~common/stylus/iconfont"

    .suggest
        height: 100%
        overflow: hidden
        .suggest-list
            padding: 0 30px
            .suggest-item
                display: flex
                align-items: center
                padding-bottom: 20px
            .icon
                flex: 0 0 30px
                width: 30px
                [class^="icon-"]
                    font-size: 14px
                    color: $color-text-d
                .icon-music:before {
                    content: "\E61B";
                    color: rgba(255,255,255,0.3);
                }
            .name
                flex: 1
                font-size: $font-size-medium
                color: $color-text-d
                overflow: hidden
                .text
                    no-wrap()
        .no-result-wrapper
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)
</style>