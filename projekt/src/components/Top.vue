<template>
  <header class="header">
    <div class="top-bar">
      <div class="container top-bar-content">
        <a href="mailto:e-mail" class="contact-link">
          e-mail <i class="fa-regular fa-envelope"></i>
        </a>
        <a href="tel:phone number" class="contact-link">
          phone number <i class="fa-solid fa-phone"></i>
        </a>
      </div>
    </div>

    <nav class="main-nav">
      <div class="container nav-content">
        <a href="#" class="logo">Name</a>

        <input
          type="checkbox"
          id="mobile-menu-toggle"
          class="mobile-menu-checkbox"
        />
        <label for="mobile-menu-toggle" class="mobile-menu-btn">
          <i class="fa-solid fa-bars"></i>
        </label>

        <ul class="nav-links">
          <li>
            <a href="#" class="active"
              >Home <i class="fa-solid fa-chevron-down"></i
            ></a>
          </li>
          <li><a href="#">Products</a></li>
          <li><a href="#">Shop</a></li>
          <li><a href="#">Contact</a></li>
        </ul>

        <div class="search-container">
          <input type="text" class="search-input" placeholder="" />
          <button class="search-btn">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>

        <div class="user-actions">
          <a href="#" class="action-link"
            >Login <i class="fa-regular fa-user"></i
          ></a>
          <a href="#" class="action-link"
            >Wishlist <i class="fa-regular fa-heart"></i
          ></a>
          <a href="#" class="cart-link"
            ><i class="fa-solid fa-cart-shopping"></i
          ></a>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");

.header * {
  box-sizing: border-box;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.top-bar {
  background-color: #7e4cd4;
  color: #ffffff;
  padding: 10px 0;
  font-size: 13px;
}

.top-bar-content {
  display: flex;
  gap: 40px;
  justify-content: flex-start;
  padding-left: 20%;
}

.contact-link {
  color: #ffffff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.3s ease;
}

.contact-link:hover {
  opacity: 0.8;
}

.main-nav {
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 20px 0;
  position: relative;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.logo {
  font-size: 28px;
  font-weight: 800;
  color: #0a0a2a;
  text-decoration: none;
  letter-spacing: -1px;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 30px;
  align-items: center;
  margin: 0;
  padding: 0;
}

.nav-links a {
  text-decoration: none;
  color: #0a0a2a;
  font-weight: 500;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;
}

.nav-links a:hover,
.nav-links a.active {
  color: #ed4c8b;
}

.nav-links a.active i {
  font-size: 12px;
}

.search-container {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #dcdcdc;
  border-right: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
}

.search-btn {
  background-color: #ed4c8b;
  color: #ffffff;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background-color: #d63d7a;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 25px;
}

.action-link {
  text-decoration: none;
  color: #0a0a2a;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  transition: color 0.3s ease;
}

.action-link:hover,
.cart-link:hover {
  color: #ed4c8b;
}

.cart-link {
  color: #0a0a2a;
  font-size: 20px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.mobile-menu-checkbox {
  display: none;
}

.mobile-menu-btn {
  display: none;
  font-size: 24px;
  color: #0a0a2a;
  cursor: pointer;
}

@media (max-width: 1100px) {
  .top-bar-content {
    padding-left: 0;
    justify-content: center;
  }
  .nav-links {
    gap: 15px;
  }
  .user-actions {
    gap: 15px;
  }
}

@media (max-width: 900px) {
  .mobile-menu-btn {
    display: block;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #ffffff;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .mobile-menu-checkbox:checked ~ .nav-links {
    display: flex;
  }

  .search-container {
    display: none;
  }

  .user-actions .action-link {
    font-size: 0;
  }

  .user-actions .action-link i {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .top-bar-content {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
}
</style>
