<script setup>
  import Dashboard from "@/components/admin/Dashboard/Dashboard.vue";
  import MainPage from "@/components/admin/MainPage.vue";
</script>

<template>
  <MainPage>
    <template #PageContent>
      <Dashboard />
    </template>
  </MainPage>
</template>