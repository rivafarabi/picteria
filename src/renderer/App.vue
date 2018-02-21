<template>
  <div id="app">
    <PictViewer/>
  </div>
</template>

<script>
import PictViewer from './components/PictViewer'

export default {
  name: 'App',
  components: {
    PictViewer
  }
}
</script>

<style>
body {
  margin: 0;
  overflow: hidden
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
