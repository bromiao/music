<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
            @touchstart.prevent="progressTouchStart"
            @touchmove.prevent="progressTouchMove"
            @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
    import {prefixStyle} from 'common/js/dom'

    const progressBtnWidth = 16 //进度条按钮长度
    const transform = prefixStyle('transform')

    export default {
        props: {
            percent: {
                type: Number,
                default: 0
            }
        },
        created() {
            this.touch = {}  //创建一个对象，用于挂载共享数据
        },
        methods: {
            progressTouchStart(e) {
                this.touch.initiated = true
                this.touch.startX = e.touches[0].pageX
                this.touch.left = this.$refs.progress.clientWidth
            },
            progressTouchMove(e) { //滑动进度条
                if(!this.touch.initiated) {
                    return
                }
                const delta = e.touches[0].pageX - this.touch.startX
                const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth,
                                       Math.max(0, this.touch.left + delta))
                this._offset(offsetWidth)
            },
            progressTouchEnd() {
                this.touch.initiated = false
                this._triggerPercent()
            },
            progressClick(e) { //点击进度条
                const rect = this.$refs.progressBar.getBoundingClientRect() //获取progressBar的位置
                const offsetWidth = e.pageX - rect.left
                this._offset(offsetWidth)
                // e.offsetX可能获取不正确
                // this._offset(e.offsetX)
                this._triggerPercent()
            },
            _triggerPercent() {  //派发给播放器组件，告知当前播放进度
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                const percent = this.$refs.progress.clientWidth / barWidth
                this.$emit('percentChange', percent)
            },
            _offset(offsetWidth) { //简单函数封装
                this.$refs.progress.style.width = `${offsetWidth}px`
                this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
            }
        },
        watch: {
            percent(newPercent) {
                if(newPercent >= 0 && !this.touch.initiated) {
                    const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                    const offsetWidth = newPercent * barWidth
                    this._offset(offsetWidth)
                }
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    width: 95%
    margin: 0 auto
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>