<script setup>
import { RouterView } from "vue-router"
import { Notifications, Notification } from "notivue"
</script>

<template>
  <RouterView />

  <Notifications>
    <Notification />
  </Notifications>
</template>

<style scoped></style>
