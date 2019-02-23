<template>
    <div class="player" v-show="playList.length>0">
        <transition name="normal"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @leave="leave"
                    @after-leave="afterLeave"
        >
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img width="100%" height="100%" :src="currentSong.image">
                </div>
                <div class="top">
                    <div class="back" @click="back">
                        <i class="iconfont icon-icon-back icon-back"></i>
                    </div>
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <h2 class="subtitle" v-html="currentSong.singer"></h2>
                </div>
                <div class="middle"
                        @touchstart.prevent="middleTouchStart"
                        @touchmove.prevent="middleTouchMove"
                        @touchend="middleTouchEnd"
                >
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdCls">
                                <img class="image" :src="currentSong.image">
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
                        </div>
                    </div>
                    <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p ref="lyricLine"
                                   class="text"
                                   :class="{'current': currentLineNum === index}"
                                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active':currentShow === 'cd'}"></span>
                        <span class="dot" :class="{'active':currentShow === 'lyric'}" ></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :percent="percent" @percentChange="onProgressChange"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left">
                            <i @click="changeMode" class="iconfont" :class="iconMode"></i>
                        </div>
                        <div class="icon i-left"  :class="disableCls">
                            <i @click="prev" class="iconfont icon-svg-"></i>
                        </div>
                        <div class="icon i-center"  :class="disableCls">
                            <i @click="togglePlaying" class="iconfont" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right"  :class="disableCls">
                            <i @click="next" class="iconfont icon-svg-1"></i>
                        </div>
                        <div class="icon i-right">
                            <i @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)" class="iconfont"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name="mini">
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <div class="icon">
                    <img :class="cdCls" width="40" height="40" :src="currentSong.image">
                </div>
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <div class="control">
                    <progress-circle :radius="radius" :percent="percent">
                        <i class="iconfont icon-mini" :class="miniIcon" @click.stop.prevent="togglePlaying"></i>
                    </progress-circle>
                </div>
                <div class="control" @click.stop.prevent="showPlayList">
                    <i class="iconfont icon-playlist"></i>
                </div>
            </div>
        </transition>
        <play-list ref="playlist"></play-list>
        <audio ref="audio" :src="currentSong.url"
               @canplay="ready"
               @error="error"
               @timeupdate="updateTime"
               @ended="end"
        ></audio>
    </div>
</template>

<script type="text/ecmascript-6">
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import animations from 'create-keyframe-animation'  //动画
    import {prefixStyle} from 'common/js/dom'
    import {playMode} from 'common/js/config'
    // import {shuffle} from "common/js/util";
    import ProgressBar from 'base/progress-bar/progress-bar'
    import ProgressCircle from 'base/progress-circle/progress-circle'
    import Scroll from 'base/scroll/scroll'
    import LyricParser from 'lyric-parser'
    import PlayList from 'components/playlist/playlist'
    import {playerMixin} from "common/js/mixin";


    const transform = prefixStyle('transform')
    const transitionDuration = prefixStyle('transitionDuration')


    export default {
        mixins: [playerMixin],
        data() {
            return {
                songReady: false,
                currentTime: 0,
                radius: 32,
                currentLyric: null,
                currentLineNum: 0,
                currentShow: 'cd',
                playingLyric: '',
                modeChangeNum: 1,
                initPlayList: null
            }
        },
        created() {
            this.touch = {}
        },
        computed: {
            playIcon() {
                return this.playing ? 'icon-pause' : 'icon-play'
            },
            miniIcon() {
                return this.playing ? 'icon-pause' : 'icon-play'
            },
            cdCls() {
                return this.playing ? 'play' : 'play pause'
            },
            disableCls() {
                return this.songReady ? '' : 'disable'
            },
            percent() {
                return this.currentTime / this.currentSong.duration
            },
            ...mapGetters([
                'fullScreen',
                'playing',
                'currentIndex'/*,
                'currentSong',
                'mode',
                'playList',
                'sequenceList'*/
            ])
        },
        methods: {
            middleTouchStart(e) {
                this.touch.initiated = true
                const touch = e.touches[0]
                this.touch.startX = touch.pageX
                this.touch.startY = touch.pageY
            },
            middleTouchMove(e) {
                if(!this.touch.initiated) {
                    return
                }
                const touch = e.touches[0]
                const deltaX = touch.pageX - this.touch.startX
                const deltaY = touch.pageY - this.touch.startY

                //如果y方向滚动大于x方向,就不让其横向滚动
                if(Math.abs(deltaY) > Math.abs(deltaX)) {
                    return
                }
                const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
                const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
                this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
                this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0 ,0)`

                this.$refs.lyricList.$el.style[transitionDuration] = 0 //移动时，动画时间置为0
                this.$refs.middleL.style.opacity = 1 - this.touch.percent
                this.$refs.middleL.style[transitionDuration] = 0
            },
            middleTouchEnd() {
                let offsetWidth = null,
                    opacity = null
                if(this.currentShow === 'cd') {
                    if(this.touch.percent > 0.1) {
                        offsetWidth = -window.innerWidth
                        this.currentShow = 'lyric'
                        opacity = 0
                    }else {
                        offsetWidth = 0
                        opacity = 1
                    }
                }else {
                    if(this.touch.percent < 0.9) {
                        offsetWidth = 0
                        opacity = 1
                        this.currentShow = 'cd'
                    }else {
                        offsetWidth = -window.innerWidth
                        opacity = 0
                    }
                }
                const timer = 0.5
                this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0 ,0)`
                this.$refs.lyricList.$el.style[transitionDuration] = `${timer}s`
                this.$refs.middleL.style.opacity = opacity
                this.$refs.middleL.style[transitionDuration] = `${timer}s`
            },
            back() {
                this.setFullScreen(false)
            },
            open() {
                this.setFullScreen(true)
            },
            enter(el, done) {
                const {x, y , scale} = this._getPosAndScale()

                let animation = {
                    0: {
                        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
                    },
                    60: {
                        transform: `translate3d(0, 0, 0) scale(1.1)`
                    },
                    100: {
                        transform: `translate3d(0, 0, 0) scale(1)`
                    }
                }

                animations.registerAnimation({
                    name: 'move',
                    animation,
                    presets: {
                        duration: 400,
                        easing: 'linear'
                    }
                })

                animations.runAnimation(this.$refs.cdWrapper, 'move', done)
            },
            afterEnter(el) {
                animations.unregisterAnimation('move')
                this.$refs.cdWrapper.style.animation = ''
            },
            leave(el, done) {
                this.$refs.cdWrapper.style.transition = 'all .4s'
                const {x, y, scale} = this._getPosAndScale()
                this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
                this.$refs.cdWrapper.addEventListener('transitionend', done) //动画执行完后，执行done
            },
            afterLeave(el) {
                this.$refs.cdWrapper.style.transition = ''
                this.$refs.cdWrapper.style[transform] = ''
            },
            _getPosAndScale() {  //mini 图片位置和缩放
                const targetWidth = 40
                const paddingLeft = 40
                const paddingTop = 80
                const paddingBottom = 30
                const width = window.innerWidth * 0.8
                const scale = targetWidth / width
                const x = -(window.innerWidth / 2 - paddingLeft)
                const y= window.innerHeight - paddingTop - width/2 - paddingBottom

                return {
                    x,
                    y,
                    scale
                }
            },
            togglePlaying() { // 播放-暂停
                if(!this.songReady) {
                    return
                }
                this.setPlayingState(!this.playing)

                if(this.currentLyric) { //歌词状态和播放状态保持一致
                    this.currentLyric.togglePlay()
                }
            },
            end() { //播放结束时行为
                if(this.mode === playMode.loop) {
                    this.loop()
                }else {
                    this.next()
                }
            },
            loop() {
                this.$refs.audio.currentTime = 0
                this.$refs.audio.play()
                this.setPlayingState(true)
                if(this.currentLyric) {
                    this.currentLyric.seek(0)
                }
            },
            changeMode() {  //切换播放模式
                let mode = (this.mode + 1) % 3;　　　　//点击循环切换
                this.setPlayMode(mode);
                let list = null;
                if(mode === playMode.random){
                    list = shuffle(this.sequenceList)
                }else{
                    list = this.sequenceList;
                }
                this.resetCurrentIndex(list);  　　//由于playlist 变成随机模式，currentsong是根据currentindex 和playlist 改变的，需要保持currentindex 在随机播放列表的正确位置，以确保当前播放歌曲不变
                this.setPlayList(list);
            },
            resetCurrentIndex(list) {  // 切换列表时保持歌曲不变
                let index = list.findIndex((item) => {
                    return item.id === this.currentSong.id
                })
                this.setCurrent(index)
            },
            prev(){
                if(!this.songReady) {
                    return
                }

                if(this.playList.length === 1) { //只有一首歌曲的情况下，上一曲和下一曲边界操作处理
                    this.loop()
                    return
                }else {
                    let index = this.currentIndex - 1
                    if(index === -1){
                        index = this.playList.length - 1
                    }
                    this.setCurrent(index)

                    if(!this.playing){
                        this.togglePlaying()
                    }else{
                        this.setPlayingState(false)
                        setTimeout(() => {
                            this.setPlayingState(true)
                        }, 20)
                    }
                }

                this.songReady = false
            },
            next(){
                if(!this.songReady) {
                    return
                }

                if(this.playList.length === 1) {
                    this.loop()
                    return
                }else {
                    let index = this.currentIndex + 1
                    if(index === this.playList.length) {
                        index = 0
                    }
                    this.setCurrent(index)

                    if(!this.playing){
                        this.togglePlaying()
                    }else{
                        this.setPlayingState(false)
                        setTimeout(() => {
                            this.setPlayingState(true)
                        }, 20)
                    }
                }

                this.songReady = false
            },
            ready() {
                this.songReady = true
                this.savePlayHistory(this.currentSong)
            },
            error() {
                this.songReady = true
            },
            updateTime(e) {
                this.currentTime = e.target.currentTime
            },
            format(duration) { // 时间格式
                duration = duration | 0
                const minute = this._pad(duration / 60 | 0)
                const second = this._pad(duration % 60)
                return `${minute}:${second}`
            },
            _pad(num, n = 2) { //默认显示时间格式显示两位
                let len = num.toString().length
                while(len < n) {
                    num = '0' + num
                    len++
                }
                return num
            },
            onProgressChange(percent) {
                const currentTime = this.currentSong.duration * percent
                this.$refs.audio.currentTime = currentTime
                if(this.currentLyric) {
                    this.currentLyric.seek(currentTime * 1000)   //歌词随进度条跳转而跳转
                }
                if(!this.playing) { //歌词滑动到位后，如果播放为暂停状态，则停止滑动
                    this.currentLyric.stop()
                }
            },
            getLyric() {
                this.currentSong.getLyric().then((lyric) => {
                    if(this.currentSong.lyric !== lyric) {
                        return
                    }
                    this.currentLyric = new LyricParser(lyric, this.handleLyric)
                    if(this.playing) {
                        this.currentLyric.play()
                    }
                    console.log(this.currentLyric)
                }).catch(() => {
                    //如果获取不到歌词
                    this.currentLyric = null
                    this.playingLyric = ''
                    this.currentLineNum = 0
                })
            },
            handleLyric({lineNum, txt}) {
                this.currentLineNum = lineNum
                if(lineNum > 5) {  // 歌词行数大于5才能滚动,歌词高亮行居中
                    let lineEl = this.$refs.lyricLine[lineNum - 5]
                    this.$refs.lyricList.scrollToElement(lineEl, 1000)
                }else {
                    this.$refs.lyricList.scrollTo(0, 0, 1000)
                }
                this.playingLyric = txt
            },
            showPlayList() {
                this.$refs.playlist.show()
            },
            ...mapMutations({  //通过mutations映射到methods,不能直接在methods里改变state
                setFullScreen: 'SET_FULL_SCREEN',/*
                setPlayingState: 'SET_PLAYING_STATE',
                setCurrent: 'SET_CURRENT',
                setPlayMode: 'SET_PLAY_MODE',
                setPlayList: 'SET_PLAY_LIST',
                setSequenceList: 'SET_SEQUENCE_LIST'*/
            }),
            ...mapActions([
                'savePlayHistory'
            ])
        },
        watch: {
            currentSong(newSong, oldSong) {
                if(newSong.id === oldSong.id || !newSong.id) {
                    return
                }
                if(this.currentLyric) {
                    this.currentLyric.stop()
                    this.currentTime = 0
                    this.playingLyric = ''
                    this.currentLineNum = 0
                }
                this.$nextTick(() => {
                    // this.$refs.audio.play()
                    this.getLyric()
                })
            },
            playing(newPlaying) {
                this.$nextTick(() => {
                    const audio = this.$refs.audio
                    newPlaying ? audio.play() : audio.pause()
                })
            },
            fullScreen(newVal) {
                if (newVal) {
                    setTimeout(() => {
                        this.$refs.lyricList.refresh()
                    }, 20)
                }
            }
        },
        components: {
            ProgressBar,
            ProgressCircle,
            Scroll,
            PlayList
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import "~common/stylus/variable"
    @import "~common/stylus/mixin"
    @import "~common/stylus/iconfont"

    .player
        .normal-player
            position: fixed
            left: 0
            right: 0
            top: 0
            bottom: 0
            z-index: 150
            background: $color-background
            .background
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                z-index: -1
                opacity: 0.6
                filter: blur(20px)
            .top
                position: relative
                margin-bottom: 25px
                .back
                    position absolute
                    top: 0
                    left: 6px
                    z-index: 50
                    .icon-back
                        display: block
                        padding: 9px
                        font-size: $font-size-large-x
                        color: $color-theme
                        transform: rotate(-90deg)
                .title
                    width: 70%
                    margin: 0 auto
                    line-height: 40px
                    text-align: center
                    no-wrap()
                    font-size: $font-size-large
                    color: $color-text
                .subtitle
                    line-height: 20px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-text
            .middle
                position: fixed
                width: 100%
                top: 80px
                bottom: 170px
                white-space: nowrap
                font-size: 0
                .middle-l
                    display: inline-block
                    vertical-align: top
                    position: relative
                    width: 100%
                    height: 0
                    padding-top: 80%
                    .cd-wrapper
                        position: absolute
                        left: 10%
                        top: 0
                        width: 80%
                        height: 100%
                        .cd
                            width: 100%
                            height: 100%
                            box-sizing: border-box
                            border: 10px solid rgba(255, 255, 255, 0.1)
                            border-radius: 50%
                            &.play
                                animation: rotate 20s linear infinite
                            &.pause
                                animation-play-state: paused
                            .image
                                position: absolute
                                left: 0
                                top: 0
                                width: 100%
                                height: 100%
                                border-radius: 50%

                    .playing-lyric-wrapper
                        width: 80%
                        margin: 30px auto 0 auto
                        overflow: hidden
                        text-align: center
                        .playing-lyric
                            height: 20px
                            line-height: 20px
                            font-size: $font-size-medium
                            color: $color-text
                .middle-r
                    display: inline-block
                    vertical-align: top
                    width: 100%
                    height: 100%
                    overflow: hidden
                    .lyric-wrapper
                        width: 80%
                        margin: 0 auto
                        overflow: hidden
                        text-align: center
                        .text
                            line-height: 32px
                            color: $color-text-l
                            font-size: $font-size-medium
                            &.current
                                color: $color-text
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .dot-wrapper
                    text-align: center
                    font-size: 0
                    .dot
                        display: inline-block
                        vertical-align: middle
                        margin: 0 4px
                        width: 8px
                        height: 8px
                        border-radius: 50%
                        background: $color-text-l
                        &.active
                            width: 20px
                            border-radius: 5px
                            background: $color-text-ll
                .progress-wrapper
                    display: flex
                    align-items: center
                    width: 80%
                    margin: 0px auto
                    padding: 10px 0
                    .time
                        color: $color-text
                        font-size: $font-size-small
                        flex: 0 0 30px
                        line-height: 30px
                        width: 30px
                        &.time-l
                            text-align: left
                        &.time-r
                            text-align: right
                    .progress-bar-wrapper
                        flex: 1
                .operators
                    display: flex
                    align-items: center
                    .icon
                        flex: 1
                        color: $color-theme
                        &.disable
                            color: $color-theme-d
                        i
                            font-size: 30px
                    .i-left
                        text-align: right
                    .i-center
                        padding: 0 20px
                        text-align: center
                        i
                            font-size: 40px
                    .i-right
                        text-align: left
                    .icon-favorite
                        color: #d93f30
                    .icon-not-favorite
                        color: #ffcd32
            &.normal-enter-active, &.normal-leave-active
                transition: all 0.4s
                .top, .bottom
                    transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
            &.normal-enter, &.normal-leave-to
                opacity: 0
                .top
                    transform: translate3d(0, -100px, 0)
                .bottom
                    transform: translate3d(0, 100px, 0)
        .mini-player
            display: flex
            align-items: center
            position: fixed
            left: 0
            bottom: 0
            z-index: 180
            width: 100%
            height: 60px
            background: $color-highlight-background
            &.mini-enter-active, &.mini-leave-active
                transition: all 0.4s
            &.mini-enter, &.mini-leave-to
                opacity: 0
            .icon
                flex: 0 0 40px
                width: 40px
                padding: 0 10px 0 20px
                img
                    border-radius: 50%
                    &.play
                        animation: rotate 10s linear infinite
                    &.pause
                        animation-play-state: paused
            .text
                display: flex
                flex-direction: column
                justify-content: center
                flex: 1
                line-height: 20px
                overflow: hidden
                .name
                    margin-bottom: 2px
                    no-wrap()
                    font-size: $font-size-medium
                    color: $color-text
                .desc
                    no-wrap()
                    font-size: $font-size-small
                    color: $color-text-d
            .control
                flex: 0 0 30px
                width: 30px
                padding: 0 10px
                .icon-play, .icon-pause, .icon-playlist
                    font-size: 30px
                    color: $color-theme-d
                .icon-mini
                    font-size: 32px
                    position: absolute
                    left: 0
                    top: 0

    @keyframes rotate
        0%
            transform: rotate(0)
        100%
            transform: rotate(360deg)
</style>