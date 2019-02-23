<template>
    <div class="recommend" ref="recommend">
        <scroll ref="scroll" class="recommend-content" :data="songList">
            <div>
                <div v-if="recommends.length" class="slider-wrapper">
                    <slider>
                        <div v-for="item in recommends" :key="item.id">
                            <a :href="item.linkUrl">
                                <img @load="loadImage" :src="item.picUrl">
                            </a>
                        </div>
                    </slider>
                </div>
                <div class="recommend-list">
                    <h1 class="list-title">热门歌单推荐</h1>
                    <ul class="songList-wrapper">
                        <li v-for="item in songList" class="item" @click="selectItem(item)">
                            <div class="icon">
                                <img width="60" height="60" v-lazy="item.imgurl">
                            </div>
                            <div class="text">
                                <h2 class="name" v-html="item.creator.name"></h2>
                                <p class="desc" v-html="item.dissname"></p>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="loading-container" v-show="!songList.length">
                    <loading></loading>
                </div>
            </div>
        </scroll>
        <router-view></router-view>
    </div>
</template>

<script>
    import Scroll from 'base/scroll/scroll'
    import Slider from 'base/slider/slider'
    import Loading from 'base/loading/loading'
    import {getRecommend, getSonglist} from "api/recommend";
    import {ERR_OK} from "api/config";
    import {playlistMixin} from "common/js/mixin";
    import {mapMutations} from 'vuex'

    export default {
        metaInfo: {
            title: '小鸡音乐-推荐',
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
                recommends: [],
                songList: []
            }
        },
        created() {
            /*setTimeout(() => {
                this._getRecommend()
            }, 2000)*/
            this._getRecommend()
            this._getSonglist()
        },
        methods: {
            selectItem(item) { //recommend子路由跳转
                this.$router.push({
                    path: `/recommend/${item.dissid}`
                })
                this.setDisc(item)
            },
            handlePlaylist(playList) {
                const bottom = playList.length > 0 ? '60px' : ''
                this.$refs.recommend.style.bottom = bottom
                this.$refs.scroll.refresh()
            },
            _getRecommend() {
                getRecommend().then((res) => {
                    if(res.code === ERR_OK) {
                        this.recommends = res.data.slider
                    }
                })
            },
            _getSonglist() {
                getSonglist().then((res) => {
                    if(res.code === ERR_OK){
                        this.songList = res.data.list
                    }
                })
            },
            loadImage() {
                if(!this.checkloaded) { //标志位
                    this.$refs.scroll.refresh() //重新计算高度
                    this.checkloaded = true
                }
            },
            ...mapMutations({
                setDisc: 'SET_DISC'
            })
        },
        components: {
            Slider,
            Scroll,
            Loading
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~common/stylus/variable"

    .recommend
        position: fixed
        width: 100%
        top: 88px
        bottom: 0
        .recommend-content
            height: 100%
            overflow: hidden
            .slider-wrapper
                position: relative
                width: 100%
                overflow: hidden
            .recommend-list
                .songList-wrapper
                    padding: 0
                .list-title
                    height: 30px
                    line-height: 30px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-theme
                .item
                    display: flex
                    box-sizing: border-box
                    align-items: center
                    padding: 0 20px
                    .icon
                        flex: 0 0 60px
                        width: 60px
                        padding-right: 20px
                    .text
                        display: flex
                        flex-direction: column
                        justify-content: center
                        flex: 1
                        line-height: 20px
                        overflow: hidden
                        font-size: $font-size-medium
                        .name
                            margin-bottom: 10px
                            color: $color-text
                            font-size: 16px
                        .desc
                            color: $color-text-d
            .loading-container
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)
</style>