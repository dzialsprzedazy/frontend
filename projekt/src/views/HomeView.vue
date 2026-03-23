<script setup></script>

<template>
  <div class="dashboard-container">
    <div class="glow-effect top-left"></div>
    <div class="glow-effect bottom-right"></div>

    <main class="content-wrapper">
      <div class="status-badge">
        <span class="pulse-dot"></span>
        E-commerce Project
      </div>

      <h1 class="main-title">Sklep internetowy</h1>
      <p class="subtitle">
        Strona w budowie. Tworzymy coś
        <span class="highlight">unikalnego</span>.
      </p>

      <div class="glass-card">
        <div class="card-header">
          <div class="window-controls">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <span class="dev-label">Dev Mode Active</span>
        </div>

        <div class="card-body">
          <div class="skeleton-line long"></div>
          <div class="skeleton-line short"></div>
          <div class="progress-bar-container">
            <div class="progress-fill"></div>
          </div>
          <p class="loading-text">Wdrażanie...</p>
        </div>
      </div>

      <footer class="footer-section">
        <router-link to="/kontakt" class="contact-link disabled">
          Masz pytania? <span>Skontaktuj się z nami &rarr;</span>
        </router-link>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.disabled {
  pointer-events: none;
}

.dashboard-container {
  min-height: 100vh;
  background-color: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  font-family: "Inter", sans-serif;
  color: #f8fafc;
}

.glow-effect {
  position: absolute;
  width: 40vw;
  height: 40vw;
  filter: blur(120px);
  opacity: 0.15;
  border-radius: 50%;
  z-index: 1;
}

.top-left {
  top: -10%;
  left: -10%;
  background: #4f46e5;
}
.bottom-right {
  bottom: -10%;
  right: -10%;
  background: #9333ea;
}

.content-wrapper {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 20px;
}

.main-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  font-weight: 300;
  margin-bottom: 3rem;
}

.highlight {
  color: #818cf8;
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(79, 70, 229, 0.1);
  border: 1px solid rgba(79, 70, 229, 0.2);
  padding: 6px 16px;
  border-radius: 99px;
  color: #818cf8;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  margin-right: 10px;
  box-shadow: 0 0 0 0 rgba(99, 101, 241, 0.7);
  animation: pulse 2s infinite;
}

.glass-card {
  max-width: 500px;
  margin: 0 auto;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.window-controls {
  display: flex;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  opacity: 0.5;
}
.red {
  background: #ef4444;
}
.yellow {
  background: #f59e0b;
}
.green {
  background: #10b981;
}

.dev-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.1em;
}

.card-body {
  padding: 2.5rem 2rem;
}

.skeleton-line {
  height: 10px;
  background: rgba(51, 65, 85, 0.5);
  border-radius: 4px;
  margin-bottom: 1rem;
  animation: shimmer 2s infinite linear;
}

.long {
  width: 80%;
}
.short {
  width: 40%;
}

.progress-bar-container {
  height: 40px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 12px;
  margin-top: 2rem;
  border: 1px solid rgba(99, 101, 241, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 65%;
  background: linear-gradient(90deg, #4f46e5, #9333ea);
  border-radius: 11px;
}

.loading-text {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #64748b;
}

.footer-section {
  margin-top: 4rem;
}
.contact-link {
  color: #94a3b8;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.contact-link span {
  color: #818cf8;
  font-weight: 500;
  margin-left: 5px;
}
.contact-link:hover {
  color: #ffffff;
}
.contact-link:hover span {
  text-decoration: underline;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(99, 101, 241, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(99, 101, 241, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(99, 101, 241, 0);
  }
}

@keyframes shimmer {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.3;
  }
}
</style>
