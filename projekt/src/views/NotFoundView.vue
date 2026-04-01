<template>
  <main class="error-page">
    <div class="error-container">
      <div class="error-visual">
        <h1 class="error-code">404</h1>
      </div>

      <div class="divider"></div>

      <div class="error-content">
        <h2 class="error-title">Strona nie istnieje.</h2>
        <p class="error-description">
          Wygląda na to, że zgubiłeś drogę. Adres, którego szukasz, jest
          niepoprawny, albo strona została na stałe usunięta.
        </p>

        <router-link to="/" class="action-btn">
          Wróć do strony głównej
        </router-link>
      </div>
    </div>
  </main>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  color: #150e24;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  padding: 2rem;
  box-sizing: border-box;
}

.error-container {
  display: flex;
  align-items: center;
  gap: 4rem;
  max-width: 1100px;
  width: 100%;
}

.error-visual {
  flex: 1;
  text-align: right;
}

.error-code {
  font-size: clamp(8rem, 15vw, 16rem);
  font-weight: 600;
  line-height: 0.8;
  letter-spacing: -0.05em;
  margin: 0;
  color: #322644;
}

.divider {
  width: 4px;
  height: 250px;
  background-color: #322644;
}

.error-content {
  flex: 1;
  text-align: left;
}

.error-title {
  font-size: clamp(2.5rem, 4vw, 4rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 1.5rem 0;
  white-space: nowrap;
  color: #322644;
}

.error-description {
  font-size: 1.25rem;
  color: #4a405c;
  line-height: 1.6;
  max-width: 450px;
  margin: 0 0 2.5rem 0;
}

.action-btn {
  display: inline-flex;
  background-color: #7d4cd4;
  color: #ffffff;
  padding: 1.25rem 2.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.action-btn:hover {
  background-color: #6138aa;
  transform: translateY(-2px);
}

@media (max-width: 1024px) {
  .error-title {
    white-space: normal;
  }
}

@media (max-width: 850px) {
  .error-container {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }

  .error-visual {
    text-align: center;
  }

  .divider {
    width: 100px;
    height: 4px;
    margin: 0 auto;
  }

  .error-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
