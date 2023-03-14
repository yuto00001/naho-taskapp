<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/img/logo.png">
    <HelloWorld msg="これはtodoAppです。まずはサインインしてください"/>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  }
}
</script>
