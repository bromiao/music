<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(item,index) in dots" :class="{active: currentIndex === index}"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'
  import {addClass} from "common/js/dom";

  export default {
      data(){
          return {
              dots: [],
              currentIndex: 0
          }
      },
      props: {
        loop: {
            type: Boolean,
            default: true
        },
        autoPlay: {
            type: Boolean,
            default: true
        },
        interval: {
            type: Number,
            default: 4000
        }
      },
      mounted() {
        setTimeout(() => {
            this._setSliderWidth()
            this._initDots()
            this._initSlider()
            if(this.autoPlay) {
                this._play()
            }
        }, 20)

          //监听窗口大小变化
          window.addEventListener('resize', () => {
              if(!this.slider){
                  return
              }
              this._setSliderWidth(true)
              this.slider.refresh()
          })
      },
      methods: {
          _setSliderWidth(isResize) {
              this.children = this.$refs.sliderGroup.children

              let width = 0,
                  sliderWidth = this.$refs.slider.clientWidth
              for(let i=0;i<this.children.length;i++){
                  let child = this.children[i]
                  addClass(child, 'slider-item')
                  child.style.width = sliderWidth + 'px'
                  width += sliderWidth
              }

              if(this.loop && !isResize){
                  width += 2 * sliderWidth
              }

              this.$refs.sliderGroup.style.width = width + 'px'
          },
          _initDots() {
              this.dots = new Array(this.children.length)
          },
          _initSlider() {
              this.slider = new BScroll(this.$refs.slider, {
                  scrollX: true,
                  scrollY: false,
                  momentum: false,
                  snap: {
                      loop: this.loop,
                      threshold: 0.3,
                      speed: 400
                  },
                  bounce: false,
                  stopPropagation: true,
                  click: true
              })

              this.slider.on('scrollEnd', () => {
                  let pageIndex = this.slider.getCurrentPage().pageX

                  this.currentIndex = pageIndex

                  if(this.autoPlay) {
                      clearTimeout(this.timer)
                      this._play()
                  }
              })
          },
          _play() {
              let pageIndex = this.currentIndex + 1

              if(this.loop) {
                  pageIndex += 1
              }

              this.timer = setTimeout(() => {
                  this.slider.next()
              }, this.interval)
          }
      },
      destroyed() {
          clearTimeout(this.timer)
      }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: relative
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>