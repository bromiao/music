<template>
  <div class="progress-circle">
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
           :stroke-dashoffset="dashOffset"   />
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      radius: {
        type: Number,
        default: 32
      },
      percent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100  //未播放状态
      }
    },
    computed: {
        dashOffset() { //偏移进度 ->>> 对应播放进度  为0时，为整圆高亮
            return (1 - this.percent) * this.dashArray
        }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg) //定义起点
        stroke: $color-theme
</style>