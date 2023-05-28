<template>
  <div class="UserIcon">
    <img class="user-icon" :src="$store.state.userData.iconURL" alt="">
  </div>
</template>

<script>
export default {
  name: 'UserIcon',
  props: {
    msg: String
  }
}
</script>

<style scoped>
</style>
