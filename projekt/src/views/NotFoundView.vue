<template>
  <div class="container-center">
    <div class="wrapper">
      <h1>404</h1>
      <span>Strona nie istnieje!</span>
    </div>
  </div>
</template>

<style scoped>
.container-center {
  height: 100vh;
  width: 100vw;
  display: grid;
  place-items: center;
  background: #161927;
}

.container-center .wrapper {
  text-align: center;
}

.wrapper h1 {
  color: #efefef;
  font-size: 13rem;
  line-height: 13rem;
  font-weight: 300;
}

.wrapper > span {
  color: #7373e7;
  font-size: 3rem;
  margin: 0;
  font-weight: 300;
}
</style>
