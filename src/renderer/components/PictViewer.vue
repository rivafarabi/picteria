<template>
  <div @keyup.left="prevPicture" @keyup.right="nextPicture">
    <div class="bar-header">
      <span class="picture-name">{{pictures[onViewIndex]}}</span>
      <div class="option-icons">
        <div class="icon" @click="zoomScroll(null, 'zoomin')"><icon name="search-plus"></icon></div>
        <div class="icon" @click="zoomScroll(null, 'zoomout')"><icon name="search-minus"></icon></div>
        <div class="icon"><icon class="icon" name="expand"></icon></div>
        <div class="icon"><icon class="icon" name="image"></icon></div>
      </div>
    </div>
    <div class="preview-pic" @drop="dropImage">
      <canvas id="canvas-pic"></canvas>
    </div>
    <div class="bar-footer" id="picture-bar">
      <div class="bar-button button-scroll-left" @mousedown="startScrollPictureBar('left')" @mouseup="stopScrollPictureBar()"><icon v-if="scrollLeftEnd" name="chevron-left"></icon></div>
      <div class="bar-button button-scroll-right" @mousedown="startScrollPictureBar('right')" @mouseup="stopScrollPictureBar()"><icon v-if="scrollRightEnd" name="chevron-right"></icon></div>
      <div id="picture-strip" style="margin: auto;">
        <div class="thumbnail-pic" v-for="(picture, index) in pictures" @click="selectImage(index)">
          <img v-bind:src="dir + '/' + picture" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FetchService from '../services/fetch-service'
const fetchService = new FetchService()

export default {
  name: 'PictViewer',
  data () {
    return {
      dir: 'D:/Farabi/Wallpaper',
      onViewIndex: 0,
      pictures: [],
      picture: null,
      canvas: null,
      context: null,
      startScroll: false,
      barScrollDir: null,
      pictureBar: null,
      isDragged: false,
      scrollPosition: 0
    }
  },
  computed: {
    scrollLeftEnd: function () {
      return this.scrollPosition !== 0
    },
    scrollRightEnd: function () {
      if (this.pictureBar) {
        return this.scrollPosition + this.pictureBar.clientWidth !== document.getElementById('picture-strip').clientWidth
      }
    }
  },
  methods: {
    selectImage: function (index) {
      this.onViewIndex = index
      this.draw()
    },
    dropImage: function (event) {
      event.preventDefault()
      var fullDir = event.dataTransfer.files[0].path
      var folderDir = fullDir.substring(0, fullDir.lastIndexOf("\\") + 1).replace(/\\/g, "/");
      console.log(folderDir)
      // fetchService.fetchDir(folderDir).then((data) => {
      //   this.pictures = data
      //   this.draw()
      // })
    },
    startScrollPictureBar: function (dir) {
      this.startScroll = true
      var currentTime = 0
      var timeInterval = 20
      var scrollSpeed = 0
      if (dir === 'left') {
        scrollSpeed = -30
      } else if (dir === 'right') {
        scrollSpeed = 30
      }
      var animateScroll = function () {
        currentTime += timeInterval
        document.getElementById('picture-bar').scrollLeft += scrollSpeed
        this.scrollPosition = document.getElementById('picture-bar').scrollLeft
        if (currentTime < 200 || this.startScroll) {
          setTimeout(animateScroll, timeInterval)
        }
      }.bind(this)
      animateScroll()
    },
    stopScrollPictureBar: function () {
      this.startScroll = false
    },
    draw: function () {
      this.context.clearRect(0, 0, this.canvas.width - 0, this.canvas.height - 0)
      this.context.save()
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.restore()
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      this.picture.src = this.dir + '/' + this.pictures[this.onViewIndex]
      var projSize = this.fitImage()
      var centerX = this.canvas.width / 2 - projSize.width / 2
      var centerY = this.canvas.height / 2 - projSize.height / 2
      this.context.drawImage(this.picture, centerX, centerY, projSize.width, projSize.height)
    },
    redraw: function () {
      this.context.clearRect(0, 0, this.canvas.width - 0, this.canvas.height - 0)
      this.context.save()
      this.context.setTransform(1, 0, 0, 1, 0, 0)
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.context.restore()
      var projSize = this.fitImage()
      var centerX = this.canvas.width / 2 - projSize.width / 2
      var centerY = this.canvas.height / 2 - projSize.height / 2
      this.context.drawImage(this.picture, centerX, centerY, projSize.width, projSize.height)
    },
    fitImage: function () {
      var imgRatio = this.picture.width / this.picture.height
      var projWidth = 0
      var projHeight = 0
      if (this.canvas.width < this.picture.width && imgRatio > 1) {
        projWidth = this.canvas.width
        projHeight = this.canvas.width / imgRatio
      } else if (this.canvas.height < this.picture.height && imgRatio < 1) {
        projHeight = this.canvas.height
        projWidth = this.canvas.height * imgRatio
      } else if (this.canvas.width > this.picture.width && this.canvas.height > this.picture.height) {
        projWidth = this.picture.width
        projHeight = this.picture.height
      }
      return {
        width: projWidth,
        height: projHeight
      }
    },
    resizeWindow: function (event) {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      this.redraw()
    },
    zoomScroll: function (event, zoom) {
      var zoomFactor
      if (event) {
        var wheel = event.wheelDelta / 120
        zoomFactor = 1 + wheel / 20
        var focusX = event.offsetX || (event.pageX - this.canvas.offsetLeft)
        var focusY = event.offsetY || (event.pageY - this.canvas.offsetTop)
        this.context.translate(focusX, focusY)
        this.context.save()
        this.context.scale(zoomFactor, zoomFactor)
        this.context.translate(-focusX, -focusY)
        this.redraw()
      } else {
        zoomFactor = 1 * (zoom === 'zoomin' ? 1.1 : 1 / 1.1)
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.context.save()
        this.context.scale(zoomFactor, zoomFactor)
        this.context.translate(-this.canvas.width / 2, -this.canvas.height / 2)
        this.redraw()
      }
    }
  },
  mounted: function () {
    this.pictureBar = document.getElementById('picture-bar')
    this.canvas = document.getElementById('canvas-pic')
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.context = this.canvas.getContext('2d')
    this.picture = new Image()

    fetchService.fetchDir(this.dir).then((data) => {
      this.pictures = data
      this.draw()
    })

    this.$nextTick(function () {
      var isDragged
      var startX
      var startY
      var targetX
      var targetY
      var panSpeed = 0.9

      window.addEventListener('resize', this.resizeWindow)
      window.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowLeft' && this.onViewIndex !== 0) {
          this.onViewIndex--
          this.draw()
        } else if (event.key === 'ArrowRight' && this.onViewIndex !== this.pictures.length - 1) {
          this.onViewIndex++
          this.draw()
        }
      })
      this.canvas.addEventListener('mousewheel', this.zoomScroll, false)
      this.canvas.addEventListener('mousedown', (event) => {
        isDragged = true
        document.body.style.userSelect = 'none'
        startX = event.offsetX || (event.pageX - this.canvas.offsetLeft)
        startY = event.offsetY || (event.pageY - this.canvas.offsetTop)
      })
      this.canvas.addEventListener('mouseup', (event) => { isDragged = false })
      this.canvas.addEventListener('mousemove', (event) => {
        if (isDragged) {
          targetX = event.offsetX || (event.pageX - this.canvas.offsetLeft)
          targetY = event.offsetY || (event.pageY - this.canvas.offsetTop)
          this.context.translate((targetX - startX) * panSpeed, (targetY - startY) * panSpeed)
          startX = targetX
          startY = targetY
          this.redraw()
        }
      })
    })
  }
}
</script>

<style lang="stylus">
.bar-header
  .picture-name
    position: absolute
    top: 0
    left: 0
    color: #fff
    margin: 16px
  .option-icons
    position: absolute
    right: 0
    margin: 12px
    .icon
      display: inline-block
      svg
        width: 28px
        height: 28px
        margin: 0 8px
        color: #95a5a6
        &:hover
          cursor: pointer
          color: #ecf0f1
.pic-preview
  height: 100%
  width: 100%
  overflow: hidden
#canvas-pic
  background-color: rgba(20, 20, 20, 1)
  width: 100%
  height: 100%
.bar-footer
  display: flex
  position: absolute
  bottom: 0
  height: 100px
  width: 100%
  background-color: rgba(20, 20, 20, 1)
  overflow-x: hidden
  overflow-y: hidden
  opacity: 0
  transition: opacity .5s
  &:hover
    opacity: 1
    transition: opacity .5s
  .bar-button
    position: fixed
    height: 100px
    width: 80px
    z-index: 10
    color: #95a5a6
    &:hover
      color: #ecf0f1
    &.button-scroll-left
      left: 0
      background: linear-gradient(to right, #141414 , transparent);
    &.button-scroll-right
      right: 0
      background: linear-gradient(to left, #141414 , transparent);
    > svg
      position: absolute
      top: 0
      bottom: 0
      left: 0
      right: 0
      margin: auto
      width: 30px
      height: 30px
  .thumbnail-pic
    display: table-cell
    padding: 8px
    opacity: .6
    > .tooltip-wrapper
      position: absolute
      visibility: hidden
      > .tooltip
        display: block
        position: relative
        top: 10px
        right: 10px
        width: 140px;
        height: 96px;
        z-index: 1
        background-color: #fefefe
      > .tooltip::after
        content: ''
        position: absolute
        top: 0
        left: 50%
        width: 10px
        height: 10px
        z-index: 100
        background-color: #fefefe
    &.active
      width: 100%
      > img
        width: 100%
    &:hover
      opacity: 1
      animation: hoverpic .2s forwards
      z-index: 10
      > .thumbnail-tooltip
        visibility: visible
    > img
      max-height: 80px
@keyframes hoverbar
  from
    opacity: 0
  to
    opacity: 1
@keyframes hoverpic
  from
    opacity: .8
    transform: scale(1)
  to
    opacity: 1
    transform: scale(1.2)
</style>
