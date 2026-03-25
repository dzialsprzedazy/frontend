<script setup></script>

<template>
  <nav class="top-navbar">
    <div class="nav-wrapper">
      <div class="contact-info">
        <a href="mailto:mhhasanul@gmail.com" class="nav-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          mhhasanul@gmail.com
        </a>
        <a href="tel:1234567890" class="nav-item">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            />
          </svg>
          (12345)67890
        </a>
      </div>

      <div class="user-actions">
        <div class="nav-item dropdown">
          English
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div class="nav-item dropdown">
          USD
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <a href="#" class="nav-item">
          Login
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </a>

        <a href="#" class="nav-item">
          Wishlist
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
            />
          </svg>
        </a>

        <a href="#" class="nav-item cart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path
              d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"
            />
          </svg>
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: "Poppins", sans-serif;
}

.top-navbar {
  background: #7c3aed;
  color: #ffffff;
  font-size: 14px;
  font-weight: 400;
  height: 48px;
  display: flex;
  align-items: center;
}

.nav-wrapper {
  padding: 0 1.1rem;
  max-width: 1450px;
  width: 100%;
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.contact-info,
.user-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #ffffff;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.nav-item:hover {
  opacity: 0.8;
}

.nav-item svg {
  flex-shrink: 0;
}

.dropdown {
  cursor: pointer;
}

@media screen and (max-width: 800px) {
  .top-navbar {
    height: auto;
    padding: 10px 0;
  }

  .nav-wrapper {
    flex-direction: column;
    gap: 10px;
  }

  .contact-info,
  .user-actions {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
}
</style>
