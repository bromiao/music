<template>
    <div class="singer" ref="singer">
        <list-view :data="singers" @select="selectSinger" ref="list"></list-view>
        <router-view></router-view>
    </div>
</template>

<script>
    import {getSingerList} from "api/singer";
    import {ERR_OK} from "api/config";
    import Singer from 'common/js/singer.js'
    import ListView from 'base/listview/listview'
    import {mapMutations}  from 'vuex'
    import {playlistMixin} from "common/js/mixin";

    const HOT = '热门'
    const HOT_SINGER_LEN = 10

    export default {
        metaInfo: {
            title: '小鸡音乐-歌手',
            meta: [
                {
                    name: 'keywords',
                    content: '小鸡音乐,想你所听,极致音效'
                },
                {
                    name: 'description',
                    content: '这是一款基于Vue打造的轻量高效WebApp'
                }
            ]
        },
        mixins: [playlistMixin],
        data() {
            return {
                singers: []
            }
        },
        created() {
            this._getSingerList()
        },
        methods: {
            handlePlaylist(playList) {
                const bottom = playList.length > 0 ? '60px' : ''
                this.$refs.singer.style.bottom = bottom
                this.$refs.list.refresh()
            },
            _getSingerList() {
                getSingerList().then((res) => {
                    if(res.code === ERR_OK){
                        this.singers = this._normalizeSinger(res.data.list)
                        // console.log(this._normalizeSinger(this.singers))
                        // console.log(this.singers)
                    }
                })
            },
            _normalizeSinger(list) {
                let map = {
                    hot: {
                        title: HOT, // 以‘热门’开头的歌手名
                        items: [] // title下的歌手列表
                    }
                }
                list.forEach((item, index) => {
                    // 热门数据，十条之内都添加到map中
                    if (index < HOT_SINGER_LEN) {
                        map.hot.items.push(new Singer({ // 热门前10条
                            id: item.Fsinger_mid,
                            name: item.Fsinger_name
                        }))
                    }
                    const key = item.Findex // Findex: "X"
                    // 如果没有以这个k为对象的聚合的话，就添加一个k,创建这个对象，因为有的姓氏开头的字母很少见
                    // 表示以前没有这个歌手名的首字母就直接添加
                    if (!map[key]) { // 以字母A B C D开头的歌手，但是存到map里的ABCD是无序的
                        map[key] = {
                            title: key,
                            items: []
                        }
                    }
                    map[key].items.push(new Singer({
                        id: item.Fsinger_mid,
                        name: item.Fsinger_name
                    }))
                })
                // 为了得到有序列表，我们需要处理 map
                let hot = [],
                    rest = []
                for(let key in map){
                    let val = map[key]
                    if(val.title.match(/[a-zA-Z]/)){
                        rest.push(val)
                    }else if(val.title === HOT){
                        hot.push(val)
                    }
                }
                rest.sort((a, b) => {
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0)
                })
                return hot.concat(rest)
            },
            selectSinger(singer) {
                this.$router.push({
                    path: `/singer/${singer.id}`
                })
                this.setSinger(singer)
            },
            ...mapMutations({  //数据映射
                setSinger: 'SET_SINGER'
            })
        },
        components: {
            ListView
        }
    }
</script>

<style lang="stylus" scoped>
    .singer
        position:absolute
        top:88px
        bottom:0
        width:100%
</style>