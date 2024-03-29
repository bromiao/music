<template>
    <scroll :probe-type="probeType"
            :data="data"
            :listenScroll="listenScroll"
            @scroll="scroll"
            class="listview"
            ref="listview">
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
                        <img v-lazy="item.avatar" class="avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart"
                                   @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
                <li v-for="(item,index) in shortcutList"
                    class="item" :class="{'current' : currentIndex === index}" :data-index="index">{{item}}</li>
            </ul>
        </div>
        <div class="list-fixed" v-show="fixedTitle" ref="fixed">
            <h1 class="fixed-title">{{fixedTitle}}</h1>
        </div>
        <div class="loading-container" v-show="!data.length">
            <loading></loading>
        </div>
    </scroll>
</template>


<script>
    import Scroll from 'base/scroll/scroll'
    import {getData} from "common/js/dom";
    import Loading from 'base/loading/loading'

    const ANCHOR_HEIGHT = 18  //右侧标签高差
    const TITLE_HEIGHT = 30   //顶部标签高度

    export default {
        props: {
            data: {
                type: Array,
                default: []
            }
        },
        created() {
            this.probeType = 3  //滑动过程中实时派发scroll事件
            this.touch = {}
            this.listenScroll = true
            this.listHeight = []
        },
        data() {
            return {
                scrollY: -1,
                currentIndex: 0,
                diff: -1
            }
        },
        computed: {
            shortcutList() {
                return this.data.map((group) => { //使用数组的map方法获取title集合
                    return group.title.substr(0,1)
                })
            },
            fixedTitle() {
                if(this.scrollY > 0){
                    return ''
                }
                return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
            }
        },
        methods: {
            refresh() {
                this.$refs.listview.refresh()
            },
            onShortcutTouchStart(e) {
                let anchorIndex = getData(e.target, 'index') // 获取 点击具体锚点的 index 值
                let firstTouch = e.touches[0]  // 第一次触碰的位置
                this.touch.y1 = firstTouch.pageY // 保存第一次触碰的位置的Y值
                this.touch.anchorIndex = anchorIndex //保存第一次触碰时的锚点的 index值
                this._scrollTo(anchorIndex)
            },
            onShortcutTouchMove(e) {
                let firstTouch = e.touches[0]
                this.touch.y2 = firstTouch.pageY
                let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0  //向下取整
                let anchorIndex = parseInt(this.touch.anchorIndex) + delta
                this._scrollTo(anchorIndex)
            },
            scroll(pos) {
                this.scrollY = pos.y
            },
            _scrollTo(index) {
                if(!index && index !== 0) {  //点击标签之外的黑色区域不做任何事
                    return
                }
                //index 边界处理
                if(index < 0) {
                    index = 0
                }else if(index > this.listHeight.length - 2){
                    index = this.listHeight.length - 2
                }
                this.scrollY = -this.listHeight[index]  //点击标签时手动设置scrollY，使其派发scroll事件
                this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 200)
            },
            _calcHeight() {
                this.listHeight = []
                let height = 0
                const list = this.$refs.listGroup
                this.listHeight.push(height)
                for(let i=0;i<list.length;i++) {
                    let item = list[i]
                    height += item.clientHeight
                    this.listHeight.push(height)
                }
            },
            selectItem(item) {
                this.$emit('select', item)
            }
        },
        watch: {
            data() {
                setTimeout(() => {
                    this._calcHeight()
                },20)
            },
            scrollY(newY) {
                const listHeight = this.listHeight

                //当滚动到顶部   newY >0
                if(newY > 0){
                    this.currentIndex = 0
                    return
                }

                //滚动到列表之间
                for(let i=0;i<listHeight.length-1;i++){
                    let height1 = listHeight[i],
                        height2 = listHeight[i+1]
                    if(-newY >= height1 && -newY < height2){
                        this.currentIndex = i
                        this.diff = height2 + newY  //标签列表之间的差值
                        // console.log(this.diff)
                        return
                    }
                }

                //滚动到底部,且 -newY大于最后一个元素的上限
                this.currentIndex = listHeight.length - 2
            },
            diff(newVal) {
                let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
                /*if (this.fixedTop === fixedTop) {
                    return
                }
                this.fixedTop = fixedTop*/
                this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
            }
        },
        components: {
            Scroll,
            Loading
        }
    }
</script>

<style lang="stylus" scoped>
    @import "~common/stylus/variable"

    .listview
        position: relative
        width: 100%
        height: 100%
        overflow: hidden
        background: $color-background
    .list-group
        padding-bottom: 30px
        .list-group-title
            height: 30px
            line-height: 30px
            padding-left: 20px
            font-size: $font-size-small
            color: $color-text-l
            background: $color-highlight-background
        .list-group-item
            display: flex
            align-items: center
            padding: 20px 0 0 30px
            .avatar
                width: 50px
                height: 50px
                border-radius: 50%
            .name
                margin-left: 20px
                color: $color-text-l
                font-size: $font-size-medium
    .list-shortcut
        position: absolute
        z-index: 30
        right: 0
        top: 50%
        transform: translateY(-50%)
        width: 20px
        padding: 20px 0
        border-radius: 10px
        text-align: center
        background: $color-background-d
        font-family: Helvetica
        .item
            padding: 3px
            line-height: 1
            color: $color-text-l
            font-size: $font-size-small
            &.current
                color: $color-theme
    .list-fixed
        position: absolute
        top: 0
        left: 0
        width: 100%
        .fixed-title
            height: 30px
            line-height: 30px
            padding-left: 20px
            font-size: $font-size-small
            color: $color-text-l
            background: $color-highlight-background
    .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>