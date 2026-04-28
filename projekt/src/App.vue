<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { Notivue, Notification } from 'notivue'
</script>

<template>
  <RouterView />
  <Notivue v-slot="item">
    <Notification :item="item" />
  </Notivue>
</template>

<style scoped>
</style>