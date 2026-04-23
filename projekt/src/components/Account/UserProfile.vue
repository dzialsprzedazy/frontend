<template>
  <div class="pageWrapper">
    
    <div class="headerBanner">
      <div class="container">
        <h1 class="headerTitle">Moje konto</h1>
        <p class="breadcrumbs">
          Home . <span class="activePage">Moje konto</span>
        </p>
      </div>
    </div>

    <div class="container mainContent">
      
      <aside class="sidebar">
        <h2 class="sidebarTitle">Moje konto</h2>
        <ul class="menuList">
          <li class="active"><i class="icon">🏠</i> Panel</li>
          <li><i class="icon">📦</i> Zamówienia</li>
          <li><i class="icon">🏷️</i> Oferty</li>
          <li><i class="icon">👤</i> Moje dane</li>
          <li><i class="icon">📍</i> Adresy</li>
          <li @click="handleLogout" class="logoutItem"><i class="icon">🚪</i> Wyloguj</li>
        </ul>
      </aside>

      <main class="contentArea">
        <h2 class="contentTitle">Moje konto</h2>
        
        <div class="infoCard">
          <h3 class="userName">{{ userName }}</h3>
          <p class="userEmail">{{ userEmail }}</p>
          
          <div class="cardActions">
            <button class="actionBtn">Zmień dane</button>
            <button class="actionBtn">Zmień hasło</button>
          </div>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const userName = ref("Dominik");
const userEmail = ref("dominik.kwiatek@gmail.com");

const router = useRouter();

const handleLogout = () => {
  alert("Wylogowano pomyślnie.");
  router.push('/'); 
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.pageWrapper {
  font-family: 'Jost', sans-serif;
  background-color: #ffffff;
  color: #101750;
}

.headerBanner {
  background-color: #f6f5ff;
  padding: 60px 0;
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.headerTitle {
  color: #101750;
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
}

.breadcrumbs {
  color: #000000;
  font-size: 16px;
  font-weight: 500;
}

.activePage {
  color: #fb2e86;
}

.mainContent {
  display: flex;
  flex-direction: column;
  padding: 60px 20px;
  gap: 40px;
}

@media (min-width: 768px) {
  .mainContent {
    flex-direction: row;
    align-items: flex-start;
  }
}

.sidebar {
  flex: 0 0 250px;
}

.sidebarTitle {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #101750;
}

.menuList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menuList li {
  font-size: 16px;
  color: #151875;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  padding: 10px 15px;
  border-radius: 6px;
}

.menuList li:hover {
  color: #fb2e86;
  background-color: #f0f2fb;
}

.menuList li.active {
  color: #101750;
  font-weight: 700;
  background-color: #f6f5ff;
}

.menuList li .icon {
  margin-right: 15px;
  font-style: normal;
  width: 20px;
  text-align: center;
  color: #9096b2;
}

.menuList li:hover .icon, .menuList li.active .icon {
  color: #fb2e86;
}

.logoutItem {
  margin-top: 10px;
  font-weight: 600;
}

.contentArea {
  flex: 1;
}

.contentTitle {
  font-size: 28px;
  font-weight: 700;
  color: #101750;
  margin-bottom: 20px;
}

.infoCard {
  background-color: #f6f5ff;
  padding: 40px;
  border-radius: 5px;
}

.userName {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 5px;
}

.userEmail {
  font-size: 16px;
  color: #606060;
  margin-bottom: 30px;
}

.cardActions {
  display: flex;
  gap: 20px;
}

.actionBtn {
  background: none;
  border: none;
  font-size: 15px;
  color: #151875;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-family: inherit;
  font-weight: 500;
  text-decoration: underline;
  transition: color 0.3s ease;
}

.actionBtn:hover {
  color: #fb2e86;
}
</style>