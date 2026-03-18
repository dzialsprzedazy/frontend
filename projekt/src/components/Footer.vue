<script setup></script>

<template>
  <footer>
    <div class="wrapper">
      <div class="left">
        <ul>
          <li>Informacje</li>
          <li>Regulacje</li>
          <li>Polityka prywatności</li>
          <li>Zarządzanie polityką Cookies</li>
        </ul>
      </div>
      <div class="right">
        <div class="icon">
          <img src="../assets/img/facebook.svg" alt="Facebook" />
        </div>
        <div class="icon">
          <img src="../assets/img/instagram.svg" alt="Instagram" />
        </div>
        <div class="icon">
          <img src="../assets/img/tiktok.svg" alt="Tik Tok" />
        </div>
      </div>
    </div>
  </footer>
</template>

<style>
main {
  min-height: calc(100vh - 220px);
}

footer {
  padding: 1rem;
  display: flex;
  align-items: center;
  color: #fff;
  min-height: 140px;
  height: 100%;
  background: #4d1b8f;
}

footer .wrapper {
  margin-inline: auto;
  width: clamp(300px, 100%, 1450px);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

footer img {
  width: 30px;
  height: 30px;
  filter: invert(100%) sepia(0%) saturate(7470%) hue-rotate(116deg)
    brightness(109%) contrast(109%);
}

footer .left ul li {
  list-style: none;
  font-weight: 300;
  padding: 1px 0;
}

footer .right {
  display: flex;
}

footer .right .icon {
  margin: 0 10px;
}
</style>
